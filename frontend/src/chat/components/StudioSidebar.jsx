import Icon from "./Icon";

const StudioSidebar = ({ fileInputRef, uploadedCount }) => (
  <aside className="sidebar flex flex-col">
    <a className="brand inline-flex items-center" href="/" aria-label="Mira home">
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
);

export default StudioSidebar;
