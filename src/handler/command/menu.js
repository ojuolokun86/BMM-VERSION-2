const sendToChat = require('../../utils/sendToChat');
const { getContextInfo, getForwardedContext } = require('../../utils/contextInfo');


const replyNumberMap = {
  '1': 'ping',
  '2': 'settings',
  '3': 'prefix',
  '4': 'mode',

  '5': 'antilink',
  '6': 'resetwarn',
  '7': 'warnlist',
  '8': 'antidelete',

  '9': 'listgroup',
  '10': 'status',
  '11': 'vv',
  '12': 'view',
  '13': 'react',
  '14': 'online',
  '15': 'privacy',
  '16': 'disappear',
  '17': 'setprofile',
  '18': 'info',

  '19': 'welcome',
  '20': 'tag',
  '21': 'tagall',
  '22': 'mute',
  '23': 'unmute',
  '24': 'lockinfo',
  '25': 'unlockinfo',
  '26': 'add',
  '27': 'kick',
  '28': 'promote',
  '29': 'demote',
  '30': 'requestlist',
  '31': 'acceptall',
  '32': 'rejectall',
  '33': 'poll'
};


const getMainMenu = (prefix = '.', ownerName = 'Unknown', mode = 'private') => `
╭━━〔 🤖 *BMM MENU* 〕━━┈⊷
┃👑 Owner: _${ownerName}_
┃🛠️ Prefix: _${prefix}_
┃⚙️ Mode: _${mode}_
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ⚙️ *Core Commands* 〕━━┈⊷
┃◈ 🏓 ping - Check bot latency **1**
┃◈ ⚙️ settings - Show bot settings **2**
┃◈ 📝 prefix - Change command prefix **3**
┃◈ 🔁 mode - Switch bot mode **4**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛡️ *Moderation Tools* 〕━━┈⊷
┃◈ 🚫 antilink - Auto-block links **5**
┃◈ ♻️ resetwarn - Reset user warnings **6**
┃◈ 📋 warnlist - View warn list **7**
┃◈ 🧾 antidelete - Restore deleted messages **8**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 👥 *Bot commands* 〕━━┈⊷
┃◈ 📜 listgroup - Show bot’s groups **9**
┃◈ 📊 status - View & react to status **10**
┃◈ 👁️‍🗨️ vv - View-once to chat **11**
┃◈ 📥 view - View-once to DM **12**
┃◈ 😂 react - Random emoji react **13**
┃◈ 🟢 online - Show who's online **14**
┃◈ 🔐 privacy - Bot privacy config **15**
┃◈ ⏳ disappear - Set disappearing msg **16**
┃◈ 🧑‍💼 setprofile - Set bot profile **17**
┃◈ ℹ️ info - Show bot info **18**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🔧 *Group Controls* 〕━━┈⊷
┃◈ 👋 welcome - Welcome messages **19**
┃◈ 🧍 tag - Mention all (plain) **20**
┃◈ 🧠 tagall - Mention all (with tags) **21**
┃◈ 🔇 mute - Lock group chat **22**
┃◈ 🔊 unmute - Unlock group chat **23**
┃◈ 🔒 lockinfo - Lock group info **24**
┃◈ 🔓 unlockinfo - Unlock group info **25**
┃◈ ➕ add - Add member **26**
┃◈ ➖ kick - Kick member **27**
┃◈ 🔼 promote - Promote to admin **28**
┃◈ 🔽 demote - Demote admin **29**
┃◈ 📥 requestlist - View join requests **30**
┃◈ ✅ acceptall - Accept all requests **31**
┃◈ ❌ rejectall - Reject all requests **32**
┃◈ 📊 poll - Create a poll **33**
╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷

📩 *Reply with a number or command name to run it.*
`;




async function menu(sock, chatId, message, prefix, ownerName, mode) {
  const menuText = getMainMenu(prefix, ownerName, mode);
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
