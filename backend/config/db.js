const mongoose = require('mongoose');
const { Client } = require('@elastic/elasticsearch');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB Connected');
};

const elasticClient = new Client({ node: 'http://localhost:5000' });

module.exports = { connectDB, elasticClient };