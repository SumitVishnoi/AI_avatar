
import { useState } from "react";
import { useChat } from "../hook/useChat";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState(null);

  const { handleAskQuery, handleSendMessage } = useChat();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!query.trim() && !file) return;

    try {
      if (file) {
        const formData = new FormData();

        formData.append("file", file);

        if (query.trim()) {
          formData.append("message", query);
        }

        await handleSendMessage(formData);
      } else {
        await handleAskQuery(query);
      }

      setQuery("");
      setFile(null);
      event.target.reset();
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <br />
        <br />
        <input
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {file && (
          <p>
            {file.name}
            <button
              type="button"
              onClick={(event) => {
                setFile(null);
                event.target.value = "";
              }}
            >
              Remove
            </button>
          </p>
        )}

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Dashboard;
