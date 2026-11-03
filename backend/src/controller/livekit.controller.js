import { randomUUID } from "node:crypto";
import { AccessToken } from "livekit-server-sdk";

export const createAvatarToken = async (_req, res) => {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    return res.status(503).json({
      success: false,
      message: "LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL on the server.",
    });
  }

  const roomName = process.env.LIVEKIT_ROOM || "synthesia-avatar";
  const identity = `guest-${randomUUID()}`;
  const accessToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    ttl: "10m",
  });

  accessToken.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: false,
    canSubscribe: true,
  });

  return res.status(200).json({
    success: true,
    serverUrl: LIVEKIT_URL,
    token: await accessToken.toJwt(),
    roomName,
    identity,
  });
};