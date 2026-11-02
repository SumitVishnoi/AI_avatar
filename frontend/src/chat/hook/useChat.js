import { askQuery, sendMessage } from "../service/chat.service";

export const useChat = () => {
  const handleSendMessage = async (formData) => {
    try {
      const data = await sendMessage(formData);
      console.log(data);
    } catch (error) {
      console.error(
        "Send Message Error:",
        error.response?.data || error.message,
      );
    }
  };

  const handleAskQuery = async (query) => {
    try {
      const data = await askQuery(query);
      console.log(data);
    } catch (error) {
      console.error("Ask Query Error:", error.response?.data || error.message);
    }
  };

  return {
    handleSendMessage,
    handleAskQuery,
  };
};
