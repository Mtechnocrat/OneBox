const Imap = require('imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.IMAP_HOST,
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

let imap;

const startImapConnection = () => {
  imap = new Imap(imapConfig);

  imap.once('ready', () => {
    console.log('📡 IMAP Connection Ready...');
    openInbox();
  });

  imap.once('error', (err) => {
    console.error('❌ IMAP Connection Error:', err);
    reconnectImap();
  });

  imap.once('end', () => {
    console.log('🔴 IMAP Connection Ended. Reconnecting...');
    reconnectImap();
  });

  imap.connect();
};

const openInbox = () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('❌ Error opening INBOX:', err);
      return reconnectImap();
    }
    console.log(`📂 INBOX Opened. Total Messages: ${box.messages.total}`);

    // Listen for new emails
    imap.on('mail', (numNewMsgs) => {
      console.log(`📩 ${numNewMsgs} new email(s) received!`);
      fetchLatestEmail();
    });

    // Start sending NOOP commands to keep connection alive
    keepAlive();
  });
};

// Periodically send a NOOP command every 5 minutes to keep IMAP alive
const keepAlive = () => {
  setInterval(() => {
    if (imap.state === 'authenticated') {
      console.log('🔄 Sending NOOP to keep IMAP connection alive...');
      imap.noop();
    }
  }, 300000); // Every 5 minutes
};

// Fetch the latest email when a new one arrives
const fetchLatestEmail = () => {
  imap.search(['ALL'], (err, results) => {
    if (err || results.length === 0) {
      console.log('No new emails.');
      return;
    }

    const latestEmailSeq = results[results.length - 1]; // Get latest email
    const fetch = imap.fetch(latestEmailSeq.toString(), { bodies: '' });

    fetch.on('message', (msg) => {
      msg.on('body', (stream) => {
        simpleParser(stream, (err, parsed) => {
          if (err) {
            console.error('Parsing error:', err);
            return;
          }

          console.log('\n📧 New Email Received 📧');
          console.log(`🔹 Subject: ${parsed.subject}`);
          console.log(`🔹 From: ${parsed.from?.text || "Unknown Sender"}`);
          console.log(`🔹 Date: ${parsed.date}`);
          console.log(`🔹 Body Preview: ${parsed.text?.substring(0, 200) || "(No text content)"}...`);
        });
      });
    });
  });
};

// Reconnect if IMAP connection closes
const reconnectImap = () => {
  console.log('🔄 Reconnecting to IMAP server in 5 seconds...');
  setTimeout(startImapConnection, 5000);
};

module.exports = { startImapConnection };
