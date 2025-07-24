const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/admin/users-info
router.get('/users-info', async (req, res) => {
    try {
        // Fetch all users
        const { data: users, error } = await supabase
            .from('user_auth')
            .select('email, auth_id, subscription_status');

        if (error) {
            console.error('❌ Error fetching users:', error.message);
            return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
        }

        // Fetch all tokens (subscription info)
        const { data: tokens, error: tokenError } = await supabase
            .from('subscription_tokens')
            .select('user_auth_id, expiration_date, subscription_level');

        if (tokenError) {
            console.error('❌ Error fetching tokens:', tokenError.message);
            return res.status(500).json({ success: false, message: 'Failed to fetch tokens.' });
        }

        // Map tokens by auth_id for quick lookup
        const tokenMap = {};
        tokens.forEach(token => {
            tokenMap[token.user_auth_id] = token;
        });

        // Attach daysLeft and subscription_level to each user
        const usersWithSubscription = users.map(user => {
            const token = tokenMap[user.auth_id];
            let daysLeft = 'N/A';
            let subscriptionLevel = user.subscription_status || 'N/A';
            if (token && token.expiration_date) {
                const expiration = new Date(token.expiration_date);
                const now = new Date();
                daysLeft = Math.max(0, Math.ceil((expiration - now) / (1000 * 60 * 60 * 24)));
                subscriptionLevel = token.subscription_level;
            }
            return {
                ...user,
                subscription_level: subscriptionLevel,
                days_left: daysLeft
            };
        });

        res.status(200).json({ success: true, users: usersWithSubscription });
    } catch (err) {
        console.error('❌ Unexpected error fetching users:', err.message);
        res.status(500).json({ success: false, message: 'Unexpected error occurred.' });
    }
});

// GET /api/admin/bots/:authId
router.get('/bots/:authId', async (req, res) => {
    const authId = req.params.authId;
    if (!authId) {
        return res.status(400).json({ success: false, message: 'authId is required.' });
    }
    try {
        // Use your local SQLite DB to fetch bots for this authId
        const Database = require('better-sqlite3');
        const path = require('path');
        const dbPath = path.join(__dirname, '../database/sessions.db');
        const db = new Database(dbPath);
        const bots = db.prepare('SELECT phone_number FROM sessions WHERE auth_id = ?').all(authId);
        res.json({ success: true, bots });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;