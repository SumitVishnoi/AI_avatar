import { askQuery, sendMessage } from "../service/chat.service";

export const useChat = () => {
  const handleSendMessage = (formData) => sendMessage(formData);
  const handleAskQuery = (query) => askQuery(query);

  return {
    handleSendMessage,
    handleAskQuery,
  };
};
