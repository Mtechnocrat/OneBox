const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { storeEmail } = require('./elasticsearchService'); // Store emails in Elasticsearch
require('dotenv').config();

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.IMAP_HOST,
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  debug: console.log,
};

let imap;

const startImapConnection = () => {
  if (imap) {
    console.log('⚠️ IMAP connection already exists. Closing...');
    imap.end();
  }

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
    imap.removeAllListeners('mail'); // Prevent duplicate listeners
    imap.on('mail', (numNewMsgs) => {
      console.log(`📩 ${numNewMsgs} new email(s) received!`);
      fetchLatestEmail();
    });

    // Send NOOP every 5 minutes to keep connection alive
    setInterval(() => {
      if (imap.state === 'authenticated') {
        console.log('🔄 Sending NOOP to keep IMAP connection alive...');
        imap.noop();
      } else {
        console.log('⚠️ IMAP connection is not authenticated.');
      }
    }, 300000); // Every 5 minutes
  });
};

// Fetch and store new emails in Elasticsearch
const fetchLatestEmail = () => {
  imap.search(['ALL'], (err, results) => {
    if (err || results.length === 0) {
      console.log('No new emails.');
      return;
    }

    const latestEmailSeq = results[results.length - 1]; // Get latest email
    const fetch = imap.fetch(latestEmailSeq.toString(), { bodies: '' });

    fetch.on('message', (msg) => {
      let emailData = '';

      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          emailData += chunk.toString();
        });

        stream.on('end', async () => {
          simpleParser(emailData, async (err, parsed) => {
            if (err) {
              console.error('❌ Parsing error:', err);
              return;
            }

            console.log('\n📧 New Email Received 📧');
            console.log(`🔹 Subject: ${parsed.subject}`);
            console.log(`🔹 From: ${parsed.from?.text || "Unknown Sender"}`);
            console.log(`🔹 Date: ${parsed.date}`);
            console.log(`🔹 Body Preview: ${parsed.text?.substring(0, 200) || "(No text content)"}...`);

            // Store email in Elasticsearch
            await storeEmail({
              subject: parsed.subject,
              from: parsed.from?.text || "Unknown Sender",
              date: parsed.date,
              body: parsed.text || "(No text content)",
              folder: "INBOX",
              account: imapConfig.user,
            });
          });
        });
      });
    });

    fetch.once('error', (err) => {
      console.error('❌ Fetch error:', err);
    });

    fetch.once('end', () => {
      console.log('✅ Email fetch complete.');
    });
  });
};

// Reconnect if IMAP connection closes
const reconnectImap = () => {
  console.log('🔄 Reconnecting to IMAP server in 5 seconds...');
  setTimeout(startImapConnection, 5000);
};

module.exports = { startImapConnection };
