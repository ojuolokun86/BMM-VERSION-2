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
  '19': 'about'
};

const getMainMenu = (prefix = '.', ownerName = 'Unknown', mode = 'private') => `
🤖 *BMM BOT COMMAND MENU*
👑 *Owner:* _${ownerName}_
🔤 *Prefix:* (${prefix})
🌍 *Mode:* _${mode}_

📂 *Basic Commands*
1️⃣ ping      🏓
2️⃣ settings  ⚙️
3️⃣ echo      🗣️
4️⃣ mode      🔤

🛡️ *Moderation Commands*
5️⃣ antilink     🔗
6️⃣ resetwarn    ♻️
7️⃣ warnlist     📋
8️⃣ antidelete   🛡️

👥 *Group & Status Tools*
9️⃣  listgroup   📋
🔟  status       👀
11️⃣ welcome     👋
12️⃣ vv          👁️ (View-once to Chat)
13️⃣ view        👁️ (View-once to DM)

🎭 *Fun & Extras*
14️⃣ react       😎
15️⃣ tagall      📢
16️⃣ privacy     🔒
17️⃣ disappear   ⏳
18️⃣ setbot      🧠
19️⃣ about       📖

📝 *Reply with a number or command name to use.*
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
