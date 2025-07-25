const { execute } = require('./commandHandler');
const detectAndAct = require('./features/detectAndAct');
const { getUserPrefix } = require('../database/database');
const  handleIncomingForAntidelete = require('../handler/features/saveAntideleteMessage');
const handleDeletedMessage  = require('./features/antideleteListener');
const { handleStatusUpdate } = require('./features/statusView');
const globalStore = require('../utils/globalStore');

async function handleIncomingMessage({ sock, msg, phoneNumber }) {
  const message = msg?.message;
  const from = msg?.key?.remoteJid;
  const sender = msg?.key?.participant || msg?.key?.remoteJid;
  const receivedFrom = msg?.key?.fromMe ? phoneNumber : from;
  const textMsg = message?.conversation || message?.extendedTextMessage?.text || '';
  const botId = sock.user.id.split(':')[0]?.split('@')[0];
  const botLid = sock.user.lid.split(':')[0]?.split('@')[0];
  const botPhoneNumber = botId && botLid;
  
  //console.log(`Received message from ${sender} in ${from}`, message);
  if (!message || !from) return;
  //console.log(`📥 Incoming message from ${sender} in ${from}: to ${receivedFrom}`, message);
  await handleDeletedMessage(sock, msg); // <- important
  await handleIncomingForAntidelete(sock, msg);
  await handleStatusUpdate(sock, msg, botId); // Handle status updates
  if (await detectAndAct({ sock, from, msg, textMsg })) return;
   const presenceType = globalStore.globalPresenceType?.[botId] || 'available';
   const duration = globalStore.globalDisappearingDuration || 0;
  // if ((duration > 0 || duration === 0) && !globalStore.disappearingChats.has(from)) {
  //   await sock.sendMessage(from, { disappearingMessagesInChat: duration });
  //   globalStore.disappearingChats.add(from);
  // }
  await sock.sendPresenceUpdate(presenceType, from);
  // ⚙️ Check for command
  const userPrefix = await getUserPrefix(botId);
  if (textMsg.startsWith(userPrefix)) {
    await execute({ sock, msg, textMsg, phoneNumber: botPhoneNumber });
  }
}

module.exports = handleIncomingMessage;

