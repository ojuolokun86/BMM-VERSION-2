const sendToChat = require('../../utils/sendToChat');
const { getContextInfo, getForwardedContext } = require('../../utils/contextInfo');


const replyNumberMap = {
  // Core Commands
  '1': 'ping',
  '2': 'settings',
  '3': 'prefix',
  '4': 'mode',
  '5': 'help',
  '6': 'menu',
  '7': 'info',

  // Moderation Tools
  '8': 'antilink',
  '9': 'resetwarn',
  '10': 'warnlist',
  '11': 'antidelete',

  // Bot Commands
  '12': 'listgroup',
  '13': 'status',
  '14': 'vv',
  '15': 'view',
  '16': 'react',
  '17': 'online',
  '18': 'privacy',
  '19': 'disappear',
  '20': 'setprofile',
  '21': 'info',

  // Group Controls
  '22': 'welcome',
  '23': 'tag',
  '24': 'tagall',
  '25': 'mute',
  '26': 'unmute',
  '27': 'lockinfo',
  '28': 'unlockinfo',
  '29': 'add',
  '30': 'kick',
  '31': 'promote',
  '32': 'demote',
  '33': 'requestlist',
  '34': 'acceptall',
  '35': 'rejectall',
  '36': 'poll',
  '37': 'group desc',
  '38': 'group pic',
  '39': 'group link',
  '40': 'group stats',
  '41': 'group revoke',

  // Extra Media & Fun Commands (not in menu yet)
  '42': 'sticker',
  '43': 'stimage',
  '44': 'stgif',
  '45': 'ss',   
};



const getMainMenu = (prefix = '.', ownerName = 'Unknown', mode = 'private', phoneNumber = 'Unknown', version = 'Unknown') => `
╭━━〔 🤖 *BMM MENU* 〕━━┈⊷
┃👑 Owner: _${ownerName}_
┃🛠️ Prefix: _${prefix}_
┃⚙️ Mode: _${mode}_
┃📱 Number: _${phoneNumber}_
┃📚 Version: _${version}_
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ⚙️ *Core Commands* 〕━━┈⊷
┃◈ 🏓 ping - Check bot latency **1**
┃◈ 🧰 settings - Show bot settings **2**
┃◈ 🔤 prefix - Change command prefix **3**
┃◈ 🔄 mode - Switch bot mode **4**
┃◈ 📚 help - Show help menu **5**
┃◈ 📚 menu - Show menu **6**
┃◈ 📚 info - Show bot info **7**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛡️ *Moderation Tools* 〕━━┈⊷
┃◈ 🧨 antilink - Auto-block links **8**
┃◈ 🧹 resetwarn - Reset user warnings **9**
┃◈ 📑 warnlist - View warn list **10**
┃◈ 🕵️‍♂️ antidelete - Restore deleted messages **11**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🤖 *Bot Commands* 〕━━┈⊷
┃◈ 🗂️ listgroup - Show bot’s groups **12**
┃◈ 📶 status - View & react to status **13**
┃◈ 👁️ vv - View-once to chat **14**
┃◈ 📤 view - View-once to DM **15**
┃◈ 😹 react - Random emoji react **16**
┃◈ 👥 online - Show who's online **17**
┃◈ 🔐 privacy - Bot privacy config **18**
┃◈ ⌛ disappear - Set disappearing msg **19**
┃◈ 🧑‍🎨 setprofile - Set bot profile **20**
┃◈ ℹ️ info - Show bot info **21**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🧰 *Group Controls* 〕━━┈⊷
┃◈ 🎉 welcome - Welcome messages **22**
┃◈ 🗣️ tag - Mention all (plain) **23**
┃◈ 📢 tagall - Mention all (with tags) **24**
┃◈ 🔇 mute - Lock group chat **25**
┃◈ 🔊 unmute - Unlock group chat **26**
┃◈ 🛑 lockinfo - Lock group info **27**
┃◈ 🆓 unlockinfo - Unlock group info **28**
┃◈ ➕ add - Add member **29**
┃◈ ➖ kick - Kick member **30**
┃◈ 🆙 promote - Promote to admin **31**
┃◈ 🧍 demote - Demote admin **32**
┃◈ 📬 requestlist - View join requests **33**
┃◈ ✅ acceptall - Accept all requests **34**
┃◈ ❌ rejectall - Reject all requests **35**
┃◈ 📊 poll - Create a poll **36**
┃◈ 📝 group desc - Edit Group description **37**
┃◈ 🖼️ group pic - Change Group picture **38**
┃◈ 🔗 group link - Get Group link **39**
┃◈ 📈 group stats - See Group stats **40**
┃◈ 🚫 group revoke - Revoke Group link **41**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎨 *Fun & Media* 〕━━┈⊷
┃◈ 🖼️ sticker - Convert image/video to sticker **42**
┃◈ 🖼️ stimage - Image to sticker (no crop) **43**
┃◈ 🖼️ stgif - GIF to animated sticker **44**
┃◈ 🌐 ss - Webpage screenshot **45**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷
📩 *Reply with a number or command name to run it.*
*Follow our channel for Update & Support*
`;



process.env.VERSION;

async function menu(sock, chatId, message, prefix, ownerName, mode, phoneNumber) {
  const menuText = getMainMenu(prefix, ownerName, mode, phoneNumber, process.env.VERSION);
  const contextInfo = {
  ...getContextInfo(),
  ...getForwardedContext()
};
  const sent = await sock.sendMessage(chatId, {
  text: menuText,
  contextInfo,
  quoted: message
});
  const menuMsgId = sent.key.id;

  const listener = async (m) => {
    const { execute } = require('../commandHandler');
    const reply = m.messages?.[0];
    if (!reply || reply.key.remoteJid !== chatId) return;

    const quotedId = reply.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (quotedId !== menuMsgId) return;

    const text = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
    const input = text.trim().toLowerCase();

    // If number → mapped command
    if (replyNumberMap[input]) {
      await execute({
        sock,
        msg: reply,
        textMsg: replyNumberMap[input],
        phoneNumber: null
      });
    }
    // If command name directly
    else {
      await execute({
        sock,
        msg: reply,
        textMsg: input,
        phoneNumber: null
      });
    }

    sock.ev.off('messages.upsert', listener);
  };

  sock.ev.on('messages.upsert', listener);
}

module.exports = { menu };
