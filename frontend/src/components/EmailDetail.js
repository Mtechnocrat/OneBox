import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EmailDetail = () => {
  const { id } = useParams();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    fetchEmailDetail();
  }, []);

  const fetchEmailDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/emails/${id}`);
      setEmail(response.data);
    } catch (error) {
      console.error("Failed to fetch email details:", error);
    }
  };

  if (!email) return <p>Loading...</p>;

  return (
    <div>
      <h2>{email.subject} ({email.category})</h2>
      <p><strong>From:</strong> {email.from}</p>
      <p><strong>To:</strong> {email.to}</p>
      <p><strong>Date:</strong> {new Date(email.date).toLocaleString()}</p>
      <hr />
      <p>{email.body}</p>
    </div>
  );
};

export default EmailDetail;
