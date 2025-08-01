const sendToChat = require('../utils/sendToChat');
const modeCommand = require('./command/mode');
const prefixCommand = require('./command/prefix');
const handleAntilinkCommand = require('./features/antiLink');
const { getUserMode, isBotOwner, getUserPrefix } = require('../database/database');
const { getUserSettings } = require('../utils/settings');
const settingsCommand = require('./command/settings');
const resetWarnCommand = require('./command/resetWarnCommand');
const warnlistCommand = require('./command/warnlistCommand');
const handleAntideleteCommand = require('./command/antideleteCommand');
const listGroupsCommand = require('./command/listGroup');
const statusCommand = require('./command/statusCommand');
const welcomeCommand = require('./command/welcomeCommand');
const { viewOnceCommand } = require('./command/viewOnce');
const reactCommand = require('./command/reactCommand');
const { getReactToCommand } = require('../database/database');
const { getEmojiForCommand } = require('./features/commandEmoji');
const tagCommand = require('./command/tag');
const presenceCommand = require('./command/presenceCommand');
const setPrivacyCommand = require('./command/privacyCommand');
const setDisappearingCommand = require('./command/disappearing');
const setBotPrivacyCommand = require('./command/privacy2');
const infoCommand = require('./command/info');
const { handleSsCommand } = require('./command/ss');
const { convertStickerToImage, convertStickerToGif } = require('./command/stToImage');
const { help } = require('./command/help');
const playCommand  = require('./command/playSong');  
const { imagine } = require('./command/imagine');
const songCommand = require('./command/song');
const { kickCommand } = require('./command/kick');
const { handleListInactiveCommand } = require('./command/groupStatsCommand');
const {
  muteGroup,
  unmuteGroup,
  requestList,
  acceptAllRequests,
  rejectAllRequests,
  addUserToGroup, 
  lockGroupInfo,
  unlockGroupInfo,
  promoteUser,
  demoteUser,
  handleGroupCommand
} = require('./command/groupCommand');
const pollCommand = require('./command/poll');
const stickerCommand = require('./command/stikcer');
const { checkIfAdmin } = require('./command/kick');
const report = require('./command/report');




function getMatchedOwner(senderId, senderLid, botId, botLid) {
  if (senderId === botId || senderId === botLid) return senderId;
  if (senderLid && (senderLid === botId || senderLid === botLid)) return senderLid;
  return null;
}

async function execute({ sock, msg, textMsg, phoneNumber }) {
  let from;
  try{
  from = msg.key.remoteJid;
  const jid = msg.key.fromMe ? msg.key.remoteJid : msg.key.participant || msg.key.remoteJid;
  const senderId = jid.split(':')[0].split('@')[0];
  const senderLid = jid.includes(':') ? jid.split(':')[1] : undefined;


  const botId = sock.user?.id?.split(':')[0]?.split('@')[0];
  const botLid = sock.user?.lid?.split(':')[0];
  const botName = sock.user?.name || 'Bot';
  const prefix = getUserPrefix(botId);
  const mode = getUserMode(botId);
  const matchedOwner = getMatchedOwner(senderId, senderLid, botId, botLid);
  //console.log(`🔍 Matched owner: ${matchedOwner} for senderId: ${senderId}, senderLid: ${senderLid}`);
  //if (!textMsg.startsWith(prefix)) return;
  //console.log(`🔍 Command starts with prefix: ${prefix} for ${botId}`);
 if (mode === 'private') {
  //console.log(`🔒 Bot in private mode. msg.fromMe: ${msg.key.fromMe}, matchedOwner: ${matchedOwner}`);
  if (!msg.key.fromMe && !matchedOwner) {
    return; // allow only bot itself or owner in private mode
  }

}
if (mode === 'admin') {
  const isGroup = from.endsWith('@g.us');
  const isOwner = !!matchedOwner;
  if (isGroup) {
    // Only admins or owner can use bot in group
    const isAdmin = await checkIfAdmin(sock, from, senderId);
    if (!isAdmin && !isOwner) {
      await sendToChat(sock, from, {
        message: '❌ Command are restricted to group admins or owner.'
      }, { quoted: msg });
      return;
    }
  } else {
    // Only owner in DM
    if (!isOwner && !msg.key.fromMe) {
      // await sendToChat(sock, from, {
      //   message: '❌ Only the bot owner can use the bot in admin mode (DM).'
      // }, { quoted: msg });
      return;
    }
  }
}


  

  let args;
    let command;

    if (textMsg.startsWith(prefix)) {
      args = textMsg.slice(prefix.length).trim().split(/\s+/);
      command = args.shift().toLowerCase();
    } else {
      args = textMsg.trim().split(/\s+/);
      command = args.shift().toLowerCase();
    }

    if (getReactToCommand(botId)) {
      const emoji = getEmojiForCommand(command);
      await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
      console.log(`🔄 Reacted with emoji: ${emoji} for command: ${command}`);
    }

    //console.log(`📥 Command received: ${command} | args: ${args.join(' ')}`);
  switch (command) {
    case 'test':
      await sendToChat(sock, from, { message: 'Test command received!' });
      break;
    case 'help':
      await help(sock, from, msg);
      break;  
    case 'menu':
      const { menu } = require('./command/menu');
      await menu(sock, from, msg, prefix, botName, mode, botId);
      break;
    case 'ping':
      await sendToChat(sock, from, { message: '🏓 Pong!' });
      //console.log(`🏓 Ping command executed by ${senderId} (${senderLid})`);
      break;
    case 'settings':
      await settingsCommand(sock, msg);
      break;
    case 'prefix':
      await prefixCommand(sock, msg, textMsg, phoneNumber);
      break;
    case 'mode':
      await modeCommand(sock, msg, textMsg, phoneNumber);
      break;
    case 'antilink':
      await handleAntilinkCommand(sock, msg, phoneNumber);
      break;
    case 'resetwarn':
      await resetWarnCommand(sock, msg, textMsg);
      break;
    case 'echo':
      const echoText = args.join(' ').trim();
      await sendToChat(sock, from, { message: echoText || '🗣️ Echo what?' });
      break;
    case 'warnlist':
        case 'listwarn':
      await warnlistCommand(sock, msg);
      break;
    case 'antidelete':
      await handleAntideleteCommand(sock, msg, phoneNumber);
      break;
    case 'listgroup':
      await listGroupsCommand(sock, msg);
      break;
    case 'status':
      await statusCommand(sock, msg);
      break;
    case 'welcome':
      await welcomeCommand(sock, msg);
      break;
    case 'vv':
    case 'view':
      await viewOnceCommand(sock, msg, command);
      break;
    case 'react':
      await reactCommand(sock, msg, textMsg);
      break;
    case 'tag':
    case 'tagall':
    case 'admin':
        await tagCommand(sock, msg, command, args);
        break;
    case 'online':
      await presenceCommand(sock, msg, args);
      break;
    case 'privacy':
      await setPrivacyCommand(sock, msg, phoneNumber);
      break;
    case 'disappear':
    case 'disappearing':
      await setDisappearingCommand(sock, msg);
      break;
    case 'setprofile':
      await setBotPrivacyCommand(sock, msg);
      break;
    case 'info':
      await infoCommand(sock, msg);
      break;
    case 'mute':
      await muteGroup(sock, msg, senderId);
      break;
    case 'unmute':
      await unmuteGroup(sock, msg, senderId);
      break;
    case 'poll':
      await pollCommand(sock, msg, textMsg);
      break;
    case 'requestlist':
      await requestList(sock, msg, phoneNumber);
      break;
    case 'acceptall':
      await acceptAllRequests(sock, msg, phoneNumber);
      break;
    case 'rejectall':
      await rejectAllRequests(sock, msg, phoneNumber);
      break;
    case 'lockinfo':
      await lockGroupInfo(sock, msg, phoneNumber);
      break;
    case 'unlockinfo':
      await unlockGroupInfo(sock, msg, phoneNumber);
      break;
    case 'add':
      await addUserToGroup(sock, msg, phoneNumber);
      break;
    case 'promote':
      await promoteUser(sock, msg, phoneNumber);
      break;
    case 'demote':
      await demoteUser(sock, msg, phoneNumber);
      break;
    case 'group':
      await handleGroupCommand(sock, msg, botId);
      break;
    case 'sticker':
      await stickerCommand(sock, msg);
      break;
    case 'ss':
    case 'ssweb':
    case 'screenshot':
      await handleSsCommand(sock, from, msg, args[0]);
      break;
    case 'stimage':
      await convertStickerToImage(sock, msg, from);
      break;
    // case 'stgif':
    //   await convertStickerToGif(sock, msg, from);
    //   break;
    case 'play':
      await playCommand(sock, from, msg);
      break;
    case 'imagine':
      await imagine(sock, msg, command, args, from);
      break;
    case 'song':
      await songCommand(sock, from, msg);
      break;
    case 'kick':
      await kickCommand(sock, msg, command, args, from);
      break;
    case 'listinactive':
      await handleListInactiveCommand(sock, from);
      break;
    case 'report':
      await report.execute({ sock, msg, textMsg, args });
      break;
    default:
      await sendToChat(sock, from, {
      message: `❌ Unknown command: *${command}*\nType *${getUserPrefix(phoneNumber)}help* for a list of commands.`
    });
    break;
}
  } catch (err) {
    console.error('❌ Command error:', err);
    await sendToChat(sock, from, {
      message: `❌ Error: ${err.message || err.toString()}`
    });
  }
}

module.exports = { execute };
