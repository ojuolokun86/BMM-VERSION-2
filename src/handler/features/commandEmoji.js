const commandEmojis = {
  test: '✅',
  ping: '🏓',
  menu: '📜',
  settings: '⚙️',
  echo: '🗣️',
  mode: '🔤',
  antilink: '🔗',
  resetwarn: '♻️',
  antidelete: '🛡️',
  warnlist: '📋',
  listgroup: '📋',
  status: '👀',
  welcome: '👋',
  vv: '👁️',
  view: '👁️',
  about: '📖',
  react: '😎',
  tagall: '📢',
  tag: '📢',
  admin: '👮',
  privacy: '🔒',
  disappear: '⏳',
  setbot: '🧠'
};

function getEmojiForCommand(command) {
  return commandEmojis[command] || '🤖';
}

module.exports = { getEmojiForCommand };
