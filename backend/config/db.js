const mongoose = require('mongoose');
const { Client } = require('@elastic/elasticsearch');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB Connected');
};

const elasticClient = new Client({
  node: 'http://localhost:9200', // Ensure 'localhost' is used
  requestTimeout: 30000, // Increase timeout
});

const checkElasticsearchConnection = async () => {
  try {
    const { body } = await elasticClient.info();
    console.log('✅ Connected to Elasticsearch:', body.version);
  } catch (error) {
    console.error('❌ Elasticsearch connection failed:', error.message);
  }
};

module.exports = { connectDB, elasticClient, checkElasticsearchConnection };