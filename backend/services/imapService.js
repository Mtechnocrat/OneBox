const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { storeEmail } = require('./elasticsearchService');
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

    // ✅ Keep IMAP connection alive every 5 minutes
    setInterval(keepImapAlive, 5 * 60 * 1000);
    // ✅ Auto-reconnect if IMAP goes idle for 10 minutes
    setInterval(reconnectIfIdle, 10 * 60 * 1000);
  });
};

// ✅ Function to Keep IMAP Connection Alive
const keepImapAlive = () => {
  if (imap.state === 'authenticated') {
    console.log('🔄 Running IMAP keep-alive command...');
    imap.search(['ALL'], (err) => {
      if (err) console.error('⚠️ IMAP keep-alive failed:', err);
      else console.log('✅ IMAP connection is active.');
    });
  } else {
    console.log('⚠️ IMAP connection lost. Reconnecting...');
    reconnectImap();
  }
};

// ✅ Function to Check for Idle Connection & Reconnect
const reconnectIfIdle = () => {
  if (imap.state !== 'authenticated') {
    console.log('⚠️ IMAP connection idle. Reconnecting...');
    reconnectImap();
  }
};

// ✅ Fetch and Store New Emails in Elasticsearch
const { classifyEmail } = require('./aiService'); // Import AI model for classification

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

            // Use AI to classify email content
            const category = await classifyEmail(parsed.text || "");

            console.log('\n📧 New Email Received 📧');
            console.log(`🔹 Subject: ${parsed.subject}`);
            console.log(`🔹 From: ${parsed.from?.text || "Unknown Sender"}`);
            console.log(`🔹 Date: ${parsed.date}`);
            console.log(`🔹 Category: ${category}`); // ✅ AI-generated category
            console.log(`🔹 Body Preview: ${parsed.text?.substring(0, 200) || "(No text content)"}...`);

            // Store email in Elasticsearch with category
            await storeEmail({
              subject: parsed.subject,
              from: parsed.from?.text || "Unknown Sender",
              date: parsed.date,
              body: parsed.text || "(No text content)",
              folder: "INBOX",
              account: imapConfig.user,
              category, // ✅ Add AI-generated category
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


// ✅ Function to Reconnect IMAP if Disconnected
const reconnectImap = () => {
  console.log('🔄 Reconnecting to IMAP server in 5 seconds...');
  setTimeout(startImapConnection, 5000000);
};

module.exports = { startImapConnection };
