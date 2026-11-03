import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { requestAvatarToken } from "../service/livekit.service";

export const useLiveKitAvatar = () => {
  const roomRef = useRef(null);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [videoTrack, setVideoTrack] = useState(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    setVideoTrack(null);
    setError("");
    setStatus("disconnected");
    audioRef.current?.replaceChildren();
    if (room) await room.disconnect();
  }, []);

  const connect = useCallback(async () => {
    if (roomRef.current) return;

    setError("");
    setStatus("connecting");

    try {
      const { serverUrl, token } = await requestAvatarToken();
      if (!serverUrl || !token) {
        throw new Error("The avatar connection response is missing its server URL or token.");
      }

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) setVideoTrack(track);
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          const element = track.attach();
          element.autoplay = true;
          audioRef.current.appendChild(element);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        const detachedElements = track.detach();
        detachedElements.forEach((element) => element.remove());
        if (track.kind === Track.Kind.Video) setVideoTrack(null);
      });

      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === room) {
          roomRef.current = null;
          setVideoTrack(null);
          audioRef.current?.replaceChildren();
          setStatus("disconnected");
        }
      });

      await room.connect(serverUrl, token);
      if (roomRef.current === room) setStatus("connected");
    } catch (connectionError) {
      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }
      const message = connectionError.response?.data?.message
        || connectionError.message
        || "Could not connect to the avatar.";
      setError(message);
      setStatus("error");
      throw connectionError;
    }
  }, []);

  useEffect(() => {
    const track = videoTrack;
    const videoElement = videoRef.current;
    if (track && videoElement) track.attach(videoElement);

    return () => {
      if (track && videoElement) track.detach(videoElement);
    };
  }, [videoTrack]);

  useEffect(() => () => {
    const room = roomRef.current;
    roomRef.current = null;
    if (room) void room.disconnect();
  }, []);

  return { connect, disconnect, error, status, videoTrack, videoRef, audioRef };
};