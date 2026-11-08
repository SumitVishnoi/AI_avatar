import { randomUUID } from "node:crypto";
import { AccessToken, TrackSource } from "livekit-server-sdk";

export const createAvatarToken = async (_req, res) => {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, SYNTHESIA_AVATAR_ID } = process.env;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL || !SYNTHESIA_AVATAR_ID) {
    return res.status(503).json({
      success: false,
      message: "Avatar connection is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, and SYNTHESIA_AVATAR_ID on the server.",
    });
  }

  const roomName = process.env.LIVEKIT_ROOM || "synthesia-avatar";
  const identity = `guest-${randomUUID()}`;
  const accessToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    ttl: "10m",
    attributes: { synthesia_avatar_id: SYNTHESIA_AVATAR_ID },
  });

  accessToken.addGrant({
    roomJoin: true,
    room: roomName,
    canPublishSources: [TrackSource.MICROPHONE],
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