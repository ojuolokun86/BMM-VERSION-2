const axios = require('axios');
const os = require('os');
const sendToChat = require('../../utils/sendToChat');
const https = require('https');
const { performance } = require('perf_hooks');


function measureLatency(url = 'https://google.com') {
  return new Promise((resolve) => {
    const start = performance.now();
    https.get(url, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        const end = performance.now();
        const latency = (end - start).toFixed(1);
        resolve(`${latency} ms`);
      });
    }).on('error', () => resolve('Error'));
  });
}

function measureDownloadSpeed(url = 'https://speed.hetzner.de/1MB.bin') {
  return new Promise((resolve) => {
    const start = performance.now();
    let totalBytes = 0;

    https.get(url, (res) => {
      res.on('data', chunk => totalBytes += chunk.length);
      res.on('end', () => {
        const end = performance.now();
        const duration = (end - start) / 1000;
        const mbps = ((totalBytes * 8) / 1_000_000 / duration).toFixed(2);
        resolve(`${mbps} Mbps`);
      });
    }).on('error', () => resolve('Error'));
  });
}

(async () => {
  const ping = await measureLatency();
  const download = await measureDownloadSpeed();

  console.log(`Ping: ${ping}`);
  console.log(`Download: ${download}`);
})();


const { exec } = require('child_process');

function getSpeedTest() {
  return new Promise((resolve, reject) => {
    exec("speedtest", (error, stdout, stderr) => {
      if (error) return reject(`Speedtest error: ${error.message}`);

      try {
        const pingMatch = stdout.match(/Latency:\s+([\d.]+)\s+ms/);
        const downloadMatch = stdout.match(/Download:\s+([\d.]+)\s+Mbps/);
        const uploadMatch = stdout.match(/Upload:\s+([\d.]+)\s+Mbps/);

        const result = {
          ping: pingMatch ? parseFloat(pingMatch[1]) : null,
          download: downloadMatch ? parseFloat(downloadMatch[1]) : null,
          upload: uploadMatch ? parseFloat(uploadMatch[1]) : null,
        };

        resolve(result);
      } catch (e) {
        reject(`Failed to parse speedtest output: ${e.message}`);
      }
    });
  });
}






// Get VPN Info
async function getVpnInfo() {
  try {
    const res = await axios.get('https://ipinfo.io/json?token=6eeb48e6940e25');
    const data = res.data;

    return {
      ip: data.ip || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      org: data.org || 'Unknown',
      hostname: data.hostname || 'Unknown'
    };
  } catch (err) {
    console.error('❌ Error fetching VPN info:', err.message);
    return null;
  }
}
const ping = require('ping');

async function getLatency(host = '8.8.8.8') {
  try {
    const res = await ping.promise.probe(host, {
      timeout: 2, // seconds
    });
    return res.time !== 'unknown' ? `${res.time} ms` : 'Timeout';
  } catch {
    return 'Error';
  }
}



// Get OS Info
function getOSInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: (os.uptime() / 60).toFixed(1) + ' mins',
    type: os.type(),
    cpu: os.cpus()[0]?.model || 'Unknown',
    totalMem: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
    freeMem: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB'
  };
}

// Main Info Command
async function infoCommand(sock, msg) {
  const from = msg.key.remoteJid;
  const quote = msg;

  let vpnBlock = '';
  let botBlock = '';
  let privacyBlock = '';
  let osBlock = '';
 
  // VPN
  const vpn = await getVpnInfo();
  const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🏳️';
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt() + 127397));
};

const locationStr = `${vpn?.city || 'Unknown'}, ${vpn?.region || ''}, ${vpn?.country || ''}`.trim();
const flagEmoji = getFlagEmoji(vpn?.countryCode || vpn?.country || ''); // 'NG' or 'DE'
const server = process.env.MASKED_ID || 'Unknown';
const maskedId = `${server}-${vpn?.countryCode || vpn?.country || 'XXX'} ${flagEmoji}`;
const { download, upload, ping } = await getSpeedTest();
const latency = await getLatency(); // Run ping test

  vpnBlock = `╭━━〔 *🛰️ SERVER Info* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• Hostname: _${vpn?.hostname || 'Unknown'}_
┃◈┃• Location: _${locationStr}_
┃◈┃• ISP: _${vpn?.org}_
┃◈┃• Latency: _${latency}_
┃◈┃• Ping: _${ping}_
┃◈┃• Download: _${download}_
┃◈┃• Upload: _${upload}_
┃◈┃• ID: _${maskedId}_
┃◈└───────────┈⊷
╰──────────────┈⊷\n`;

  // Bot Info
  try {
    const name = sock.user?.name || 'Unknown';
    const bio = await sock.fetchStatus?.(sock.user.id) || {};
    botBlock = `╭━━〔 *🤖 Bot Info* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• Name: _${name}_
┃◈┃• Bio: _${bio.status || 'Unknown'}_
┃◈└───────────┈⊷
╰──────────────┈⊷\n`;
  } catch {
    botBlock = '❌ Failed to fetch bot info.\n';
  }

  // Privacy
  try {
    const privacy = await sock.fetchPrivacySettings?.(true);
    privacyBlock = '╭━━〔 *🔐 Privacy Settings* 〕━━┈⊷\n┃◈╭─────────────·๏\n';
    for (const [key, value] of Object.entries(privacy || {})) {
      privacyBlock += `┃◈┃• ${key}: _${value}_\n`;
    }
    privacyBlock += '┃◈└───────────┈⊷\n╰──────────────┈⊷\n';
  } catch {
    privacyBlock = '❌ Failed to fetch privacy settings.\n';
  }

  // OS Info
  const osInfo = getOSInfo();
  osBlock = `╭━━〔 *🖥️ System Info* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• Hostname: _${osInfo.hostname}_
┃◈┃• Platform: _${osInfo.platform}_
┃◈┃• Architecture: _${osInfo.arch}_
┃◈┃• OS: _${osInfo.type} ${osInfo.release}_
┃◈┃• Uptime: _${osInfo.uptime}_
┃◈┃• CPU: _${osInfo.cpu}_
┃◈┃• Memory: _${osInfo.freeMem} / ${osInfo.totalMem}_
┃◈└───────────┈⊷
╰──────────────┈⊷\n`;

  const infoMessage = `${vpnBlock}${botBlock}${privacyBlock}${osBlock}`;
  await sendToChat(sock, from, { message: infoMessage }, { quoted: quote });
}

module.exports = infoCommand;
