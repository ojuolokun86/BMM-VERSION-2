const sendToChat = require('../../utils/sendToChat');

const replyNumberMap = {
  '1': 'ping',
  '2': 'settings',
  '3': 'echo',
  '4': 'mode',
  '5': 'antilink',
  '6': 'resetwarn',
  '7': 'warnlist',
  '8': 'antidelete',
  '9': 'listgroup',
  '10': 'status',
  '11': 'welcome',
  '12': 'vv',
  '13': 'view',
  '14': 'react',
  '15': 'tagall',
  '16': 'privacy',
  '17': 'disappear',
  '18': 'setbot',
  '19': 'about',
  '20': 'info'
};

const getMainMenu = (prefix = '.', ownerName = 'Unknown', mode = 'private') => `
╭━━〔 🤖 *BMM MENU* 〕━━┈⊷
┃◈ Owner: _${ownerName}_
┃◈ Prefix: _${prefix}_
┃◈ Mode: _${mode}_
┃◈ Masked ID: _${process.env.MASKED_ID || 'Not Set'}_
┃◈ Version: _${process.env.VERSION || '1.0.0'}_
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🧩 *Basic Commands* 〕━━┈⊷
┃◈ 1️⃣ • ping - Check latency
┃◈ 2️⃣ • settings - Bot settings
┃◈ 3️⃣ • echo - Repeat your text
┃◈ 4️⃣ • mode - Switch mode
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛡️ *Moderation Tools* 〕━━┈⊷
┃◈ 5️⃣ • antilink - Block links
┃◈ 6️⃣ • resetwarn - Reset warnings
┃◈ 7️⃣ • warnlist - Show warns
┃◈ 8️⃣ • antidelete - Block deletes
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 👥 *Group / Status* 〕━━┈⊷
┃◈ 9️⃣  • listgroup - List groups
┃◈ 🔟  • status - Show bot status
┃◈ 11️⃣ • welcome - Welcome msgs
┃◈ 12️⃣ • vv - View-once to chat
┃◈ 13️⃣ • view - View-once to DM
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎭 *Fun & Extras* 〕━━┈⊷
┃◈ 14️⃣ • react - Random emoji
┃◈ 15️⃣ • tagall - Mention all
┃◈ 16️⃣ • privacy - Set privacy
┃◈ 17️⃣ • disappear - Disappearing msg
┃◈ 18️⃣ • setbot - Update bot info
┃◈ 19️⃣ • about - Bot info
┃◈ 20️⃣ • info - Detailed info
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

📩 *Reply with a number or command name to run it.*
`;



async function menu(sock, chatId, message, prefix, ownerName, mode) {
  const menuText = getMainMenu(prefix, ownerName, mode);
  const sent = await sock.sendMessage(chatId, { text: menuText, quoted: message });
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
