import { useEffect, useRef, useState } from "react";
import heroImage from "../../assets/hero.png";
import { useChat } from "../hook/useChat";
import { useLiveKitAvatar } from "../hook/useLiveKitAvatar";

const icons = {
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  close: ["m18 6-12 12", "m6 6 12 12"],
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h8"],
  mic: ["M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z", "M19 10v2a7 7 0 0 1-14 0v-2", "M12 19v3", "M8 22h8"],
  plus: ["M12 5v14", "M5 12h14"],
  send: ["m22 2-7 20-4-9-9-4Z", "M22 2 11 13"],
  settings: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.6 2.8-.2-.1a1.7 1.7 0 0 0-1.9.3l-.1.1h-3.2l-.1-.2a1.7 1.7 0 0 0-1.7-1l-.2.1-2.8-1.6.1-.2a1.7 1.7 0 0 0-.3-1.9l-.1-.1v-3.2l.2-.1a1.7 1.7 0 0 0 1-1.7l-.1-.2 1.6-2.8.2.1a1.7 1.7 0 0 0 1.9-.3l.1-.1h3.2l.1.2a1.7 1.7 0 0 0 1.7 1l.2-.1 2.8 1.6-.1.2a1.7 1.7 0 0 0 .3 1.9l.1.1v3.2Z"],
  sparkle: ["m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z", "m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"],
  video: ["m15 10 5-3v10l-5-3", "M3 6h12v12H3z"],
};

const Icon = ({ name, size = 18, className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {icons[name].map((path) => <path d={path} key={path} />)}
  </svg>
);

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const createQueryMessage = (data) => {
  const matches = Array.isArray(data?.result) ? data.result : [];
  const sources = matches
    .map((match) => match?.fields?.text ?? match?.metadata?.text ?? match?.text)
    .filter((text) => typeof text === "string" && text.trim());

  return {
    id: createId(),
    role: "assistant",
    text: sources.length
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
    status: avatarStatus,
    videoTrack,
    videoRef,
    audioRef,
  } = useLiveKitAvatar();
  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const list = messagesRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const submitMessage = async (event) => {
    event.preventDefault();
    const prompt = query.trim();
    const selectedFile = file;
    if ((!prompt && !selectedFile) || isSending) return;

    const userMessage = {
      id: createId(),
      role: "user",
      text: prompt,
      attachment: selectedFile?.name,
    };
    setMessages((current) => [...current, userMessage]);
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
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            text: `“${selectedFile.name}” is ready in your knowledge base. Ask me a question whenever you’re ready.`,
          },
        ]);
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
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          isError: true,
          text: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
        },
      ]);
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
    } catch {
      // The hook keeps and exposes the connection error for the avatar panel.
    }
  };

  const statusLabel = {
    connected: "In the room",
    connecting: "Connecting",
    error: "Connection issue",
    disconnected: "Ready when you are",
  }[avatarStatus];

  return (
    <div className="studio-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Mira home">
          <span className="brand-mark"><Icon name="sparkle" size={20} /></span>
          <span>mira<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">S</div>
          <div className="workspace-copy">
            <span className="eyebrow">WORKSPACE</span>
            <strong> space</strong>
          </div>
          <span className="switcher-chevron">⌄</span>
        </div>

        <div className="sidebar-label">YOUR STUDIO</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#conversation"><Icon name="sparkle" size={17} /> Companion</a>
          <button className="nav-item" type="button" onClick={() => fileInputRef.current?.click()}>
            <Icon name="file" size={17} /> Knowledge base <span className="nav-count">{uploadedCount}</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-tip">
          <div className="tip-glow"><Icon name="sparkle" size={17} /></div>
          <strong>A little more you.</strong>
          <p>Upload your notes to help Mira give answers that feel personal.</p>
        </div>
        <button className="profile-button" type="button">
          <span className="profile-avatar">S</span>
          <span className="profile-copy"><strong>ABC</strong><small>Personal space</small></span>
          <Icon name="settings" size={17} />
        </button>
      </aside>

      <main className="studio-main">
        <header className="topbar">
          <div className="breadcrumb"><span>Studio</span><span className="breadcrumb-slash">/</span><strong>Companion</strong></div>
          <div className="topbar-actions">
            <span className="privacy-note"><span className="privacy-dot" /> Your space is private</span>
            <button className="mobile-profile" type="button" aria-label="Profile">S</button>
          </div>
        </header>

        <div className="studio-content">
          <section className="conversation-panel" id="conversation" aria-label="Chat with Mira">
            <div className="conversation-heading">
              <div>
                <div className="section-kicker"><span className="live-dot" /> YOUR AI COMPANION</div>
                <h1>A space to think out loud<span>.</span></h1>
                <p>Good questions deserve a thoughtful conversation.</p>
              </div>
              <button className="icon-button history-button" type="button" aria-label="Conversation options">
                <span className="more-dots">···</span>
              </button>
            </div>

            <div className="message-list" ref={messagesRef} aria-live="polite">
              <div className="date-divider"><span>Today</span></div>
              {messages.map((message) => (
                <article className={`message-row ${message.role}`} key={message.id}>
                  {message.role === "assistant" && (
                    <div className="message-avatar"><Icon name="sparkle" size={15} /></div>
                  )}
                  <div className="message-content">
                    <div className="message-meta">
                      <strong>{message.role === "assistant" ? "Mira" : "You"}</strong>
                      {message.role === "assistant" && <span>AI companion</span>}
                    </div>
                    <div className={`message-bubble${message.isError ? " error-bubble" : ""}`}>
                      {message.attachment && (
                        <div className="attachment-preview"><Icon name="file" size={16} /><span>{message.attachment}</span></div>
                      )}
                      {message.text && <p>{message.text}</p>}
                      {message.sources?.map((source, index) => (
                        <blockquote className="source-card" key={`${message.id}-${index}`}>{source}</blockquote>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
              {isSending && (
                <div className="message-row assistant">
                  <div className="message-avatar"><Icon name="sparkle" size={15} /></div>
                  <div className="message-content">
                    <div className="message-meta"><strong>Mira</strong><span>Thinking</span></div>
                    <div className="message-bubble typing-indicator" aria-label="Mira is thinking">
                      <i /><i /><i />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="composer-wrap">
              {file && (
                <div className="selected-file">
                  <Icon name="file" size={16} />
                  <span>{file.name}</span>
                  <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} aria-label="Remove selected file">
                    <Icon name="close" size={15} />
                  </button>
                </div>
              )}
              <form className="composer" onSubmit={submitMessage}>
                <input
                  ref={fileInputRef}
                  className="visually-hidden"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  aria-label="Upload a PDF"
                />
                <button className="composer-tool" type="button" aria-label="Attach a PDF" onClick={() => fileInputRef.current?.click()}>
                  <Icon name="plus" size={19} />
                </button>
                <input
                  type="text"
                  placeholder={file ? "Add a note about this document…" : "Ask Mira anything…"}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Message Mira"
                />
                <button className="composer-tool voice-tool" type="button" aria-label="Voice input (coming soon)" title="Voice input coming soon">
                  <Icon name="mic" size={18} />
                </button>
                <button className="send-button" type="submit" disabled={isSending || (!query.trim() && !file)} aria-label="Send message">
                  <Icon name="send" size={17} />
                </button>
              </form>
              <div className="composer-hint">Mira can make mistakes. Check important information.</div>
            </div>
          </section>

          <aside className="avatar-panel" aria-label="Live avatar">
            <div className="avatar-panel-top">
              <div>
                <div className="section-kicker avatar-kicker">LIVE COMPANION</div>
                <h2>Meet Mira</h2>
              </div>
              <span className={`connection-pill ${avatarStatus}`}><span />{statusLabel}</span>
            </div>

            <div className={`avatar-stage${videoTrack ? " has-video" : ""}`}>
              <div className="stage-grid" />
              <div className="stage-orbit orbit-one" />
              <div className="stage-orbit orbit-two" />
              <img src={heroImage} alt="" className="avatar-art" />
              <video ref={videoRef} className="avatar-video" autoPlay playsInline aria-label="Mira avatar video" />
              <div ref={audioRef} className="avatar-audio" />
              {!videoTrack && (
                <div className="avatar-placeholder-copy">
                  <span className="avatar-presence"><i /></span>
                  <strong>{avatarStatus === "connected" ? "Mira is joining the room." : "Your companion, in real time."}</strong>
                  <span>{avatarStatus === "connected" ? "Waiting for the Synthesia participant to join…" : "Connect to start a face-to-face conversation."}</span>
                </div>
              )}
              <div className="stage-caption"><span className="caption-orb"><Icon name="sparkle" size={13} /></span><span>Mira</span><i /></div>
            </div>

            {avatarError && <p className="avatar-error" role="alert">{avatarError}</p>}
            <div className="avatar-controls">
              <div className="avatar-description">
                <strong>A more human kind of help</strong>
                <span>Powered by Synthesia · LiveKit</span>
              </div>
              <button
                type="button"
                className={`connect-button${avatarStatus === "connected" ? " connected" : ""}`}
                onClick={handleAvatarToggle}
                disabled={avatarStatus === "connecting"}
              >
                <Icon name={avatarStatus === "connected" ? "close" : "video"} size={17} />
                {avatarStatus === "connected" ? "Leave session" : avatarStatus === "connecting" ? "Connecting…" : "Talk to Mira"}
              </button>
            </div>

            <div className="avatar-note">
              <span className="note-icon"><Icon name="sparkle" size={15} /></span>
              <p><strong>Here for the little things, too.</strong><br />Talk naturally and let your thoughts find their shape.</p>
            </div>
          </aside>
        </div>
        <footer className="studio-footer"><span>Made for curious minds</span><span>✨ &nbsp;Take your time. You’re in good company.</span></footer>
      </main>
    </div>
  );
};

export default Dashboard;
