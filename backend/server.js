const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const emailRoutes = require('./routes/emailRoutes');
const { startImapConnection } = require('./services/imapService');

dotenv.config();
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Start IMAP persistent connection
startImapConnection();



// API Routes
app.use('/api/emails', emailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const { checkElasticsearchConnection } = require('./config/db');

checkElasticsearchConnection();
