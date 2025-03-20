const { elasticClient } = require('../config/db');


const ensureIndexExists = async () => {
  const exists = await elasticClient.indices.exists({ index: 'emails' });
  if (!exists.body) {
    console.log('⚡ Creating missing "emails" index...');
    await elasticClient.indices.create({
      index: 'emails',
      body: {
        settings: { number_of_shards: 1, number_of_replicas: 1 },
        mappings: {
          properties: {
            subject: { type: 'text' },
            from: { type: 'keyword' },
            to: { type: 'keyword' },
            date: { type: 'date' },
            body: { type: 'text' }
          }
        }
      }
    });
  }
};

const indexEmail = async (emailData) => {
  try {
    await ensureIndexExists();
    console.log('📩 Indexing email:', emailData);
    
    await elasticClient.index({
      index: 'emails',
      body: emailData,
    });
    console.log('✅ Email indexed successfully');
  } catch (error) {
    console.error('❌ Failed to index email:', error);
  }
};
const storeEmail = async (email) => {
  try {
    await elasticClient.index({
      index: 'emails',
      body: email,
    });
    console.log(`📥 Email stored in Elasticsearch: ${email.subject}`);
  } catch (error) {
    console.error('❌ Failed to store email in Elasticsearch:', error);
  }
};

const searchEmails = async (query, folder, account) => {
  try {
    const searchParams = {
      index: 'emails',
      body: {
        query: {
          bool: {
            must: [{ match: { body: query } }],
            filter: [],
          },
        },
      },
    };

    if (folder) searchParams.body.query.bool.filter.push({ term: { folder } });
    if (account) searchParams.body.query.bool.filter.push({ term: { account } });

    const { body } = await elasticClient.search(searchParams);
    return body.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.error('❌ Elasticsearch search error:', error);
    return [];
  }
};


module.exports = { storeEmail, searchEmails ,indexEmail};
