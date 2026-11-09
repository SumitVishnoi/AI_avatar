import Icon from "./Icon";

const AvatarPanel = ({
  avatarError,
  avatarId,
  avatarStatus,
  audioRef,
  disconnectOrConnect,
  isMicrophoneEnabled,
  microphoneToggle,
  videoRef,
  videoTrack,
}) => {
  const statusLabel = {
    connected: "In the room",
    connecting: "Connecting",
    error: "Connection issue",
    disconnected: "Ready when you are",
  }[avatarStatus];

  return (
    <aside className="avatar-panel" aria-label="Live avatar">
      <div className="avatar-panel-top">
        <div>
          <div className="section-kicker avatar-kicker">LIVE COMPANION</div>
          <h2>Meet Mira</h2>
        </div>
        <span className={`connection-pill ${avatarStatus}`}><span />{statusLabel}</span>
      </div>

      {avatarId && (
        <p className="mb-3 rounded-lg bg-violet-50 px-3 py-2 text-[10px] leading-relaxed text-violet-700">
          Selected avatar ID: <code className="break-all font-mono font-semibold">{avatarId}</code>
        </p>
      )}

      <div className={`avatar-stage${videoTrack ? " has-video" : ""}${isMicrophoneEnabled ? " mic-active" : ""}`}>
        <div className="stage-grid" />
        <div className="stage-orbit orbit-one" />
        <div className="stage-orbit orbit-two" />
        <div className="avatar-idle-art" aria-hidden="true">
          <span className="avatar-idle-halo" />
          <span className="avatar-idle-bust"><i /></span>
          <span className="avatar-idle-sparkle"><Icon name="sparkle" size={17} /></span>
        </div>
        <video ref={videoRef} className="avatar-video" autoPlay playsInline aria-label="Mira avatar video" />
        <div ref={audioRef} className="avatar-audio" />
        {!videoTrack && (
          <div className="avatar-placeholder-copy">
            <span className="avatar-presence"><i /></span>
            <strong>
              {isMicrophoneEnabled
                ? "Mira is listening."
                : avatarStatus === "connected"
                  ? "Mira is joining the room."
                  : avatarStatus === "connecting"
                    ? "Connecting Mira…"
                    : "Your companion, in real time."}
            </strong>
            <span>
              {isMicrophoneEnabled
                ? "Speak naturally, or use the chat to share a thought."
                : avatarStatus === "connected"
                  ? "Waiting for Mira to join the room…"
                  : "Start a conversation to bring Mira to life."}
            </span>
          </div>
        )}
        <div className="stage-caption">
          <span className="caption-orb"><Icon name="sparkle" size={13} /></span>
          <span>Mira</span>
          <i />
          {isMicrophoneEnabled && <span className="listening-label">Listening</span>}
        </div>
      </div>

      {avatarError && <p className="avatar-error" role="alert">{avatarError}</p>}
      <div className="avatar-controls">
        <div className="avatar-description">
          <strong>A more human kind of help</strong>
          <span>Powered by Synthesia · LiveKit</span>
        </div>
        <button
          type="button"
          className={`microphone-button${isMicrophoneEnabled ? " active" : ""}`}
          onClick={microphoneToggle}
          disabled={avatarStatus !== "connected"}
          aria-label={isMicrophoneEnabled ? "Mute microphone" : "Enable microphone"}
          aria-pressed={isMicrophoneEnabled}
          title={avatarStatus === "connected" ? undefined : "Start a conversation to use your microphone"}
        >
          <Icon name="mic" size={16} />
          {isMicrophoneEnabled ? "Mute" : "Mic"}
        </button>
        <button
          type="button"
          className={`connect-button${avatarStatus === "connected" ? " connected" : ""}`}
          onClick={disconnectOrConnect}
          disabled={avatarStatus === "connecting"}
        >
          <Icon name={avatarStatus === "connected" ? "close" : "video"} size={17} />
          {avatarStatus === "connected" ? "End session" : avatarStatus === "connecting" ? "Connecting…" : "Talk to Mira"}
        </button>
      </div>

      <div className="avatar-note">
        <span className="note-icon"><Icon name="sparkle" size={15} /></span>
        <p><strong>Here for the little things, too.</strong><br />Talk naturally and let your thoughts find their shape.</p>
      </div>
    </aside>
  );
};

export default AvatarPanel;
