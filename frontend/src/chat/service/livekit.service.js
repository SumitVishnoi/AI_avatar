import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const requestAvatarToken = async () => {
  const response = await api.post("/api/livekit/token");
  return response.data;
};
