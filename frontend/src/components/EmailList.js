import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const EmailList = () => {
  const [emails, setEmails] = useState([]); // State for storing emails
  const [search, setSearch] = useState(""); // Search query state
  const [folder, setFolder] = useState(""); // Folder filter state
  const [account, setAccount] = useState(""); // Account filter state

  useEffect(() => {
    fetchEmails();
  }, []);

  // Fetch all emails from the backend
  const fetchEmails = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/emails");
      setEmails(response.data);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    }
  };

  // Search emails using Elasticsearch
  const searchEmails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/emails/search?q=${search}&folder=${folder}&account=${account}`
      );
      setEmails(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div>
      <h2>📩 Emails</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search emails..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Folder Filter */}
      <select onChange={(e) => setFolder(e.target.value)}>
        <option value="">All Folders</option>
        <option value="INBOX">Inbox</option>
        <option value="SPAM">Spam</option>
      </select>

      {/* Account Filter */}
      <select onChange={(e) => setAccount(e.target.value)}>
        <option value="">All Accounts</option>
        <option value="user1@example.com">user1@example.com</option>
        <option value="user2@example.com">user2@example.com</option>
      </select>

      {/* Search Button */}
      <button onClick={searchEmails}>🔍 Search</button>

      {/* Display Email List */}
      <ul>
        {emails.map((email) => (
          <li key={email.id}>
            <Link to={`/email/${email.id}`}>
              <strong>{email.subject}</strong> ({email.category})<br />
              From: {email.from} | Date: {new Date(email.date).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailList;
