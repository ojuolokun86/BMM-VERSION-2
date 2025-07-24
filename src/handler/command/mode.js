const { setUserMode, getUserMode } = require('../../database/database');
const sendToChat = require('../../utils/sendToChat');

function getMatchedOwner(senderId, senderLid, botId, botLid) {
  if (senderId === botId || senderId === botLid) return senderId;
  if (senderLid && (senderLid === botId || senderLid === botLid)) return senderLid;
  return null;
}

module.exports = async function modeCommand(sock, msg, textMsg, phoneNumber) {
  const from = msg.key.remoteJid;
  const senderId = msg.key.participant
    ? msg.key.participant.split('@')[0]
    : msg.key.remoteJid.split('@')[0];

  const senderLid = msg.key.participant
    ? msg.key.participant.split(':')[1]
    : msg.key.remoteJid.split(':')[1];

  const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const botLid = sock.user?.lid?.split(':')[0];
  const matchedOwner = getMatchedOwner(senderId, senderLid, botId, botLid);

  const [, mode] = textMsg.split(' ');
  if (!['public', 'private', 'admin'].includes(mode)) {
    await sendToChat(sock, from, { message: 'Usage: .mode public|private|admin' });
    return;
  }

  if (!matchedOwner) {
    await sendToChat(sock, from, { message: '❌ Only the bot owner can set the mode.' });
    return;
  }

  setUserMode(botId, mode);
  //console.log(`Mode set to ${mode} by ${matchedOwner} botId: ${botId}`);
  await sendToChat(sock, from, { message: `✅ Mode set to *${mode}*.` });
};
