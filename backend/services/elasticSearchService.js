const { elasticClient } = require('../config/db');

/**
 * Ensure the Elasticsearch index exists before storing emails.
 * This should be called only once when the server starts.
 */
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
            body: { type: 'text' },
            folder: { type: 'keyword' },
            account: { type: 'keyword' },
            category: { type: 'keyword' }, // ✅ Added AI categorization field
          }
        }
      }
    });
  }
};

/**
 * Store an email in Elasticsearch with a unique ID.
 * @param {Object} email - The email object.
 */
const storeEmail = async (email) => {
  try {
    await elasticClient.index({
      index: 'emails',
      id: `${email.account}-${Date.now()}`, // ✅ Ensure unique ID
      body: email,
    });
    console.log(`📥 Email stored in Elasticsearch: ${email.subject}, Category: ${email.category}`);
  } catch (error) {
    console.error('❌ Failed to store email in Elasticsearch:', error);
  }
};

/**
 * Search for emails with a query, optionally filtered by folder & account.
 * @param {string} query - The search query.
 * @param {string} [folder] - Optional folder filter.
 * @param {string} [account] - Optional account filter.
 * @returns {Array} - Array of matching emails.
 */
const searchEmails = async (query, folder, account) => {
  try {
    const searchParams = {
      index: 'emails',
      body: {
        query: {
          bool: {
            must: [
              { multi_match: { query, fields: ['subject', 'body', 'from'] } }, // ✅ Search by subject, body, or sender
            ],
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

/**
 * Initialize Elasticsearch settings when the server starts.
 */
const initializeElasticsearch = async () => {
  await ensureIndexExists();
  console.log('✅ Elasticsearch index verified.');
};

module.exports = { storeEmail, searchEmails, initializeElasticsearch };
