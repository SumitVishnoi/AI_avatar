import Icon from "./Icon";

const ConversationPanel = ({
  file,
  fileInputRef,
  handleSpeakMessage,
  handleVoiceInput,
  isListening,
  isSending,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  messages,
  messagesRef,
  query,
  setFile,
  setQuery,
  speakingMessageId,
  speechError,
  submitMessage,
}) => (
  <section className="conversation-panel flex min-w-0 flex-col" id="conversation" aria-label="Chat with Mira">
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
              {message.role === "assistant" && message.text && !message.isError && (
                <button
                  className="speech-button"
                  type="button"
                  onClick={() => handleSpeakMessage(message)}
                  disabled={!isSpeechSynthesisSupported}
                  aria-label={speakingMessageId === message.id ? "Stop reading response" : "Read response aloud"}
                  title={isSpeechSynthesisSupported ? "Read response aloud" : "Speech playback is not supported in this browser"}
                >
                  <Icon name={speakingMessageId === message.id ? "stop" : "speaker"} size={14} />
                  {speakingMessageId === message.id ? "Stop" : "Listen"}
                </button>
              )}
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
        <button
          className={`composer-tool voice-tool${isListening ? " listening" : ""}`}
          type="button"
          onClick={handleVoiceInput}
          disabled={!isSpeechRecognitionSupported}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          aria-pressed={isListening}
          title={isSpeechRecognitionSupported ? (isListening ? "Stop voice input" : "Dictate a message") : "Speech recognition is not supported in this browser"}
        >
          <Icon name="mic" size={18} />
        </button>
        <button className="send-button" type="submit" disabled={isSending || (!query.trim() && !file)} aria-label="Send message">
          <Icon name="send" size={17} />
        </button>
      </form>
      <div className={`composer-hint${speechError ? " speech-error" : ""}`} role={speechError ? "alert" : undefined}>
        {speechError || (isListening ? "Listening… speak your message." : "Mira can make mistakes. Check important information.")}
      </div>
    </div>
  </section>
);

export default ConversationPanel;
