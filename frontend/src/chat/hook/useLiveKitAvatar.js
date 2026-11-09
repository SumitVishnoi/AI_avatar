import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { requestAvatarToken } from "../service/livekit.service";

export const useLiveKitAvatar = () => {
  const roomRef = useRef(null);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [videoTrack, setVideoTrack] = useState(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    setVideoTrack(null);
    setAvatarId("");
    setIsMicrophoneEnabled(false);
    setError("");
    setStatus("disconnected");
    audioRef.current?.replaceChildren();
    if (room) await room.disconnect();
  }, []);

  const setMicrophoneEnabled = useCallback(async (enabled) => {
    const room = roomRef.current;
    if (!room) throw new Error("Connect to Mira before enabling your microphone.");

    try {
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setIsMicrophoneEnabled(enabled);
      setError("");
    } catch (microphoneError) {
      setError(microphoneError.message || "Could not access your microphone.");
      throw microphoneError;
    }
  }, []);

  const connect = useCallback(async () => {
    if (roomRef.current) return;

    setError("");
    setStatus("connecting");

    try {
      const { serverUrl, token, avatarId: selectedAvatarId } = await requestAvatarToken();
      if (!serverUrl || !token || !selectedAvatarId) {
        throw new Error("The avatar connection response is missing its server URL, token, or configured avatar ID.");
      }
      setAvatarId(selectedAvatarId);

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
          setAvatarId("");
          setIsMicrophoneEnabled(false);
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
      setAvatarId("");
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

  return {
    connect,
    disconnect,
    error,
    avatarId,
    status,
    videoTrack,
    videoRef,
    audioRef,
    isMicrophoneEnabled,
    setMicrophoneEnabled,
  };
};