# **OneBox**

## **📌 Project Overview**
This project is a **real-time email processing system** that:
- **Syncs multiple IMAP accounts** in real-time.
- **Stores and indexes emails** in Elasticsearch for fast searching.
- **Uses AI to categorize emails** into predefined labels.

## **⚙️ Features**
### ✅ **1. Real-Time Email Synchronization**
- Supports **multiple IMAP accounts**.
- **Fetches the last 30 days of emails** upon startup.
- Uses **IMAP IDLE mode** for real-time email updates.

### 🔍 **2. Searchable Storage Using Elasticsearch**
- Emails are stored and indexed in **Elasticsearch**.
- Supports **full-text search** for subjects and body content.
- Allows **filtering by folder and account**.

### 🤖 **3. AI-Based Email Categorization**
- Uses **TensorFlow.js** for AI-based classification.
- Categorizes emails into:
  - Interested
  - Meeting Booked
  - Not Interested
  - Spam
  - Out of Office

---

## **🛠️ Tech Stack**
- **Backend:** Node.js, Express.js
- **Database & Search Engine:** MongoDB, Elasticsearch
- **AI Model:** TensorFlow.js, Universal Sentence Encoder
- **IMAP Library:** `imap` package for email fetching
- **Containerization:** Docker

---

## **📂 Folder Structure**
```
📦 Email-Processing-System
 ┣ 📂 backend
 ┃ ┣ 📂 config
 ┃ ┃ ┣ db.js   # Database and Elasticsearch configuration
 ┃ ┣ 📂 services
 ┃ ┃ ┣ imapService.js  # Handles IMAP connection & email fetching
 ┃ ┃ ┣ elasticsearchService.js  # Stores & searches emails
 ┃ ┃ ┣ aiService.js  # AI-based email categorization
 ┃ ┣ 📂 routes
 ┃ ┃ ┣ emailRoutes.js  # API routes for email operations
 ┃ ┣ server.js  # Express server setup
 ┣ 📂 frontend
 ┃ ┣ 📂 components
 ┃ ┃ ┣ EmailList.js  # Displays emails
 ┃ ┃ ┣ SearchBar.js  # Search functionality
 ┃ ┃ ┣ CategoryFilter.js  # Filters by AI categories
 ┃ ┣ App.js  # Main UI
 ┃ ┣ index.js  # React entry point
 ┣ Dockerfile  # Docker setup
 ┣ README.md  # Project documentation
```

---

## **🚀 Setup Instructions**

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/yourusername/Email-Processing-System.git
cd Email-Processing-System
```

### **2️⃣ Backend Setup**
#### **Install Dependencies**
```bash
cd backend
npm install
```
#### **Set Up Environment Variables**
Create a `.env` file in `backend/` and add:
```env
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
IMAP_HOST=imap.example.com
ELASTICSEARCH_URL=http://localhost:9200
```
#### **Start Backend Server**
```bash
npm start
```

### **3️⃣ Elasticsearch Setup (Docker)**
```bash
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.10.2
```

### **4️⃣ Frontend Setup**
```bash
cd frontend
npm install
npm start
```

---

## **🛠️ API Endpoints**
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/emails/fetch30` | Fetches the last 30 days of emails |
| GET | `/api/emails/search?q=keyword` | Searches emails in Elasticsearch |
| GET | `/api/emails/latest` | Fetches the latest email |
| POST | `/api/emails/categorize` | AI categorization for an email |

---

## **📌 Feature Implementation Details**

### **1️⃣ Real-Time Email Synchronization**
- Uses the `imap` package for real-time email fetching.
- Listens for new emails using **IMAP IDLE mode**.
- Automatically retries if the connection drops.

#### **Example Code (IMAP Connection)**
```javascript
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const imapConfig = { /* IMAP settings */ };
const imap = new Imap(imapConfig);
imap.once('ready', () => {
  imap.openBox('INBOX', false, () => {
    console.log('IMAP Ready');
  });
});
imap.connect();
```

### **2️⃣ Searchable Storage with Elasticsearch**
- Stores each email in an Elasticsearch index (`emails`).
- Uses **Boolean queries** to filter emails based on sender, subject, and body.

#### **Example Code (Elasticsearch Search)**
```javascript
const searchEmails = async (query) => {
  return await elasticClient.search({
    index: 'emails',
    body: {
      query: { match: { body: query } }
    }
  });
};
```

### **3️⃣ AI-Based Email Categorization**
- Uses **TensorFlow.js** to load a **pre-trained NLP model**.
- Categorizes emails into **5 labels** based on content similarity.

#### **Example Code (AI Categorization)**
```javascript
const use = require('@tensorflow-models/universal-sentence-encoder');
let model;
(async () => { model = await use.load(); })();
const categorizeEmail = async (emailText) => {
  const embeddings = await model.embed([emailText]);
  return predictCategory(embeddings.arraySync()[0]);
};
```

---

## **🎯 Future Enhancements**
- Implement **user authentication** for secure email access.
- Add **machine learning improvements** for better email classification.
- Enhance the **frontend UI** for a better user experience.

---

## **📢 Contributing**
Feel free to contribute! Fork this repository, make changes, and submit a PR.

**Happy Coding! 🚀**
