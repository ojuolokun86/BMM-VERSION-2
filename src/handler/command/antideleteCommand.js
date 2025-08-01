const sendToChat = require('../../utils/sendToChat');
const { quotedInfo } = require('../../utils/sendToChat');
const {
  setAntideleteMode,
  excludeGroup,
  includeGroup,
  isGroupExcluded,
  deleteAllAntideleteSettings,
  shouldForwardToOwner,
  setForwardToDm
} = require('../../database/antideleteDb');
const { isBotOwner } = require('../../database/database');


const menu = (forwardToOwner) => `
*🛡️ Antidelete Settings*
Reply with the number to choose:
0. 🔕 Turn OFF (all)
1. 💬 Enable for *private chat* only
2. 👥 Enable for *group chat* only
3. 🔄 Enable for *both*
4. ❌ Exclude/include this group from restore
5. 📥 Restore deleted messages to *DM* instead of group/chat: *${forwardToOwner ? 'ON' : 'OFF'}*

_Only the *bot owner* can set these settings._
`;

async function handleAntideleteCommand(sock, msg, phoneNumber) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const botLid = sock.user?.lid?.split(':')[0]?.split('@')[0];
  const senderId = sender?.split('@')[0];
  const bot = botId && botLid;
  const name = sock.user?.name;

  if (!msg.key.fromMe && !isBotOwner(senderId, botId, botLid)) {
    return await sendToChat(sock, from, {
      message: `❌ Only *${name}* can configure Antidelete settings.`
    });
  }

  const forwardToOwner = shouldForwardToOwner(botId);
  const menuText = menu(forwardToOwner);
  const quote = quotedInfo();
  // Send menu and get its message ID
  const sentMenu = await sock.sendMessage(from, { text: menuText }, { quoted: quote });
  const menuMsgId = sentMenu.key.id;

  // Setup listener
  const listener = async (m) => {
    const reply = m.messages?.[0];
    if (!reply) return;
    if (!bot) {
      await sendToChat(sock, from, {
        message: `❌ Only *${name}* can configure Antidelete settings.`
      });
      sock.ev.off('messages.upsert', listener);
      return;
    }

    const replyFrom = reply.key.remoteJid;
    const replySender = reply.key.participant || reply.key.remoteJid;
    if (replyFrom !== from || replySender !== sender) return;

    const context = reply.message?.extendedTextMessage?.contextInfo;
    const isReplyToMenu = context?.stanzaId === menuMsgId;

    if (!isReplyToMenu) return;

    const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
    const option = parseInt(body.trim());

    if (isNaN(option) || ![0, 1, 2, 3, 4, 5].includes(option)) {
      await sendToChat(sock, from, { message: `❌ Invalid option. Try again.` });
      sock.ev.off('messages.upsert', listener);
      return;
    }

    switch (option) {
      case 0:
        setAntideleteMode(botId, 'off');
        await sendToChat(sock, from, { message: '🔕 Antidelete is now *disabled* for all chats and groups.' });
        break;
      case 1:
        setAntideleteMode(botId, 'chat');
        await sendToChat(sock, from, { message: '💬 Antidelete is now *enabled for private chat* only.' });
        break;
      case 2:
        setAntideleteMode(botId, 'group');
        await sendToChat(sock, from, { message: '👥 Antidelete is now *enabled for groups* only.' });
        break;
      case 3:
        setAntideleteMode(botId, 'both');
        await sendToChat(sock, from, { message: '🔄 Antidelete is now *enabled for both chat & group*.' });
        break;
      case 4:
        if (isGroupExcluded(botId, from)) {
          includeGroup(botId, from);
          await sendToChat(sock, from, { message: '✅ Group included back in antidelete.' });
        } else {
          excludeGroup(botId, from);
          await sendToChat(sock, from, { message: '🚫 Group excluded from antidelete.' });
        }
        break;
      case 5:
        const currentState = shouldForwardToOwner(botId);
        const newState = !currentState;
        setForwardToDm(botId, newState);
        await sendToChat(sock, from, {
          message: `📥 Deleted messages will now be restored to *${newState ? 'DM' : 'original chat'}*.`
        });
        break;
    }

    sock.ev.off('messages.upsert', listener);
  };

  sock.ev.on('messages.upsert', listener);
}

module.exports = handleAntideleteCommand;
