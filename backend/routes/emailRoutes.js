const express = require('express');
const { fetchLast30DaysEmails } = require('../services/imapService');

const router = express.Router();

// API Route for fetching the latest email
router.get('/latest', (req, res) => {
  fetchLatestEmail((email) => {
    res.json(email);
  });
});

router.get('/fetch30', async (req, res) => {
  try {
    const emails = await fetchLast30DaysEmails();
    res.json({ success: true, emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emails' });
  }
});

module.exports = router;
