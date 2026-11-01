import { useState } from "react";
import { useChat } from "../hook/useChat";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const { handleAskQuery } = useChat();

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) {
      handleAskQuery(query);
      setQuery("")
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={query}
          onChange={handleInputChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Dashboard;
