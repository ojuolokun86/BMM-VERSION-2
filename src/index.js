const { createServer } = require('./server/server');
const { restoreAllSessionsFromSupabase } = require('./database/sqliteAuthState');
const { startBmmBot } = require('./main/main');
const Database = require('better-sqlite3');
const path = require('path');

process.on('unhandledRejection', (reason, promise) => {
  console.error('🛑 Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});


/** * Starts all bots based on sessions stored in the SQLite database.
 * Reads auth_id and phone_number from the sessions table
 * and starts a bot for each session.
 * * @returns {Promise<void>}
 */
// This function will read the sessions from the SQLite database and start a bot for each session.
async function startAllBots() {

  // Match the dbPath from sqliteAuthState.js
  const dbPath = path.join(__dirname, 'database', 'sessions.db');
  const db = new Database(dbPath);

  const rows = db.prepare('SELECT auth_id, phone_number FROM sessions').all();
  if (rows.length === 0) {
    console.info('❗ No sessions found in the database.');
    return;
  }

  let success = 0;
  for (const { auth_id, phone_number } of rows) {
    try {
      await startBmmBot({
        authId: auth_id,
        phoneNumber: phone_number,
        pairingMethod: 'none', // Not needed, just placeholder
        country: null,         // Optional
        onStatus: () => {},    // Optional dummy
      });
      console.log(`✅ Started bot for ${auth_id} (${phone_number})`);
      success++;
    } catch (err) {
      console.error(`❌ Failed to start ${auth_id} (${phone_number}):`, err.message);
    }
  }
  console.log(`🚀 Started ${success} out of ${rows.length} bots successfully.`);
}

(async () => {
  console.log('🚀 Starting BMM DEV V2...');
  createServer();
  await restoreAllSessionsFromSupabase(); // Restore from Supabase first
  await startAllBots(); // Then start all bots from SQLite
})();
