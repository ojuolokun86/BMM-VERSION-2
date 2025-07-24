const { setUserPrefix, getUserPrefix, isBotOwner } = require('../../database/database');
const sendToChat = require('../../utils/sendToChat');

module.exports = async function prefixCommand(sock, msg, textMsg, phoneNumber) {
  const from = msg.key.remoteJid;
  const senderId = msg.key.participant
    ? msg.key.participant.split('@')[0]
    : msg.key.remoteJid.split('@')[0];
  const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const botLid = sock.user?.lid?.split(':')[0];

  // ✅ Check if sender is the bot owner
  if (!isBotOwner(senderId, null, botId, botLid)) {
    await sendToChat(sock, from, {
      message: '❌ Only the bot owner can change the prefix.'
    });
    return;
  }

  // ✅ Get current prefix
  const currentPrefix = getUserPrefix(phoneNumber);
  const args = textMsg.slice(currentPrefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (command !== 'prefix' || args.length < 1) {
    await sendToChat(sock, from, {
      message: `Usage: ${currentPrefix}prefix <new_prefix>\nCurrent prefix: *${currentPrefix}*`
    });
    return;
  }

  const newPrefix = args[0];
  if (!newPrefix || newPrefix.length > 3) {
    await sendToChat(sock, from, { message: '❌ Invalid prefix. Please use 1–3 characters.' });
    return;
  }

  setUserPrefix(botId, newPrefix);
  console.log(`Prefix updated for ${botId} to ${newPrefix}`);
  await sendToChat(sock, from, { message: `✅ Prefix updated to *${newPrefix}*.` });
};
