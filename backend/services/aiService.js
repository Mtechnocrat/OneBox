const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs');

const categories = [
  "Interested",
  "Meeting Booked",
  "Not Interested",
  "Spam",
  "Out of Office"
];

let model;

/**
 * Loads the Universal Sentence Encoder (USE) model.
 */
const loadModel = async () => {
  if (!model) {
    console.log("📥 Loading AI model (browser version)...");
    model = await use.load();
    console.log("✅ AI model loaded successfully.");
  }
};

/**
 * Categorizes an email based on its content using TensorFlow.js.
 * @param {string} emailText - The email body to classify.
 * @returns {Promise<string>} - The predicted category.
 */
const classifyEmail = async (emailText) => {
  if (!model) await loadModel();

  // Generate embeddings for the email text and categories
  const emailEmbedding = await model.embed([emailText]);
  const categoryEmbeddings = await model.embed(categories);

  // Compute cosine similarities
  const similarities = tf.matMul(categoryEmbeddings, emailEmbedding.transpose()).arraySync();
  
  // Find the best-matching category
  const maxIndex = similarities.map(row => row[0]).indexOf(Math.max(...similarities.map(row => row[0])));

  return categories[maxIndex];
};

module.exports = { classifyEmail, loadModel };
