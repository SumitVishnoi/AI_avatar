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
  const avatarLabel = avatarId ? "Selected avatar" : "Mira";

  return (
    <aside className="avatar-panel" aria-label="Live avatar">
      <div className="avatar-panel-top">
        <div>
          <div className="section-kicker avatar-kicker">LIVE COMPANION</div>
          <h2>{avatarId ? "Selected avatar" : "Meet Mira"}</h2>
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
        <video ref={videoRef} className="avatar-video" autoPlay playsInline aria-label={`${avatarLabel} avatar video`} />
        <div ref={audioRef} className="avatar-audio" />
        {!videoTrack && (
          <div className="avatar-placeholder-copy">
            <span className="avatar-presence"><i /></span>
            <strong>
              {isMicrophoneEnabled
                ? `${avatarLabel} is listening.`
                : avatarStatus === "connected"
                  ? `${avatarLabel} is joining the room.`
                  : avatarStatus === "connecting"
                    ? `Connecting ${avatarLabel.toLowerCase()}…`
                    : avatarId
                      ? "Selected avatar is ready to connect."
                      : "Your companion, in real time."}
            </strong>
            <span>
              {isMicrophoneEnabled
                ? "Speak naturally, or use the chat to share a thought."
                : avatarStatus === "connected"
                  ? `Waiting for ${avatarId ? "the selected avatar" : "Mira"} to join the room…`
                  : avatarId
                    ? "Start a conversation to bring your selected avatar to life."
                    : "Start a conversation to bring Mira to life."}
            </span>
          </div>
        )}
        <div className="stage-caption">
          <span className="caption-orb"><Icon name="sparkle" size={13} /></span>
          <span>{avatarId ? "Avatar" : "Mira"}</span>
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
          {avatarStatus === "connected" ? "End session" : avatarStatus === "connecting" ? "Connecting…" : avatarId ? "Talk to avatar" : "Talk to Mira"}
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
