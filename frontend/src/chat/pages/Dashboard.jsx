import { useEffect, useRef, useState } from "react";
import { useChat } from "../hook/useChat";
import { useLiveKitAvatar } from "../hook/useLiveKitAvatar";
import AvatarPanel from "../components/AvatarPanel";
import ConversationPanel from "../components/ConversationPanel";
import StudioSidebar from "../components/StudioSidebar";

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const createQueryMessage = (data) => {
  const matches = Array.isArray(data?.result) ? data.result : [];
  const sources = matches
    .map((match) => match?.fields?.text ?? match?.metadata?.text ?? match?.text)
    .filter((text) => typeof text === "string" && text.trim());

  return {
    id: createId(),
    role: "assistant",
    text: typeof data?.answer === "string" && data.answer.trim()
      ? data.answer.trim()
      : sources.length
        ? `I found ${sources.length} relevant ${sources.length === 1 ? "passage" : "passages"} in your documents.`
        : "I couldn’t find a matching passage in your uploaded documents. Try another question or add a document.",
    sources,
  };
};

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hey there! I’m your AI companion. Ask me anything about your uploaded documents, or connect with me face to face.",
    },
  ]);
  const { handleAskQuery, handleSendMessage } = useChat();
  const {
    connect: connectAvatar,
    disconnect: disconnectAvatar,
    error: avatarError,
    avatarId,
    status: avatarStatus,
    videoTrack,
    videoRef,
    audioRef,
    isMicrophoneEnabled,
    setMicrophoneEnabled,
  } = useLiveKitAvatar();
  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const list = messagesRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    setIsSpeechRecognitionSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    setIsSpeechSynthesisSupported(Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance));

    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    const baseQuery = query.trim();
    recognitionRef.current = recognition;
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    setSpeechError("");

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setQuery([baseQuery, transcript].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") setSpeechError(`Speech recognition failed: ${event.error}.`);
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      recognitionRef.current = null;
      setSpeechError(error.message || "Could not start speech recognition.");
    }
  };

  const handleSpeakMessage = (message) => {
    if (!isSpeechSynthesisSupported) return;

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(message.text);
    utterance.lang = navigator.language || "en-US";
    utterance.onend = () => {
      setSpeakingMessageId((currentId) => (currentId === message.id ? null : currentId));
    };
    utterance.onerror = () => {
      setSpeakingMessageId((currentId) => (currentId === message.id ? null : currentId));
    };
    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const submitMessage = async (event) => {
    event.preventDefault();
    const prompt = query.trim();
    const selectedFile = file;
    if ((!prompt && !selectedFile) || isSending) return;

    setMessages((current) => [...current, {
      id: createId(),
      role: "user",
      text: prompt,
      attachment: selectedFile?.name,
    }]);
    setIsSending(true);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (prompt) formData.append("message", prompt);

        await handleSendMessage(formData);
        setUploadedCount((count) => count + 1);
        setFile(null);
        setQuery("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setMessages((current) => [...current, {
          id: createId(),
          role: "assistant",
          text: `“${selectedFile.name}” is ready in your knowledge base. Ask me a question whenever you’re ready.`,
        }]);
        if (prompt) {
          const data = await handleAskQuery(prompt);
          setMessages((current) => [...current, createQueryMessage(data)]);
        }
      } else {
        const data = await handleAskQuery(prompt);
        setMessages((current) => [...current, createQueryMessage(data)]);
      }

      setQuery("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setMessages((current) => [...current, {
        id: createId(),
        role: "assistant",
        isError: true,
        text: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAvatarToggle = async () => {
    if (avatarStatus === "connected" || avatarStatus === "connecting") {
      await disconnectAvatar();
      return;
    }

    try {
      await connectAvatar();
      await setMicrophoneEnabled(true);
    } catch {
      // Avatar hook exposes connection and microphone errors in its panel.
    }
  };

  const handleMicrophoneToggle = async () => {
    try {
      await setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch {
      // Avatar hook exposes microphone errors in its panel.
    }
  };

  return (
    <div className="studio-shell flex min-h-screen">
      <StudioSidebar fileInputRef={fileInputRef} uploadedCount={uploadedCount} />

      <main className="studio-main flex min-w-0 flex-1 flex-col">
        <header className="topbar">
          <div className="breadcrumb"><span>Studio</span><span className="breadcrumb-slash">/</span><strong>Companion</strong></div>
          <div className="topbar-actions">
            <span className="privacy-note"><span className="privacy-dot" /> Your space is private</span>
            <button className="mobile-profile" type="button" aria-label="Profile">S</button>
          </div>
        </header>

        <div className="studio-content grid flex-1">
          <ConversationPanel
            file={file}
            fileInputRef={fileInputRef}
            handleSpeakMessage={handleSpeakMessage}
            handleVoiceInput={handleVoiceInput}
            isListening={isListening}
            isSending={isSending}
            isSpeechRecognitionSupported={isSpeechRecognitionSupported}
            isSpeechSynthesisSupported={isSpeechSynthesisSupported}
            messages={messages}
            messagesRef={messagesRef}
            query={query}
            setFile={setFile}
            setQuery={setQuery}
            speakingMessageId={speakingMessageId}
            speechError={speechError}
            submitMessage={submitMessage}
          />
          <AvatarPanel
            avatarError={avatarError}
            avatarId={avatarId}
            avatarStatus={avatarStatus}
            audioRef={audioRef}
            disconnectOrConnect={handleAvatarToggle}
            isMicrophoneEnabled={isMicrophoneEnabled}
            microphoneToggle={handleMicrophoneToggle}
            videoRef={videoRef}
            videoTrack={videoTrack}
          />
        </div>

        <footer className="studio-footer">
          <span>Made for curious minds</span>
          <span>✨ &nbsp;Take your time. You’re in good company.</span>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
