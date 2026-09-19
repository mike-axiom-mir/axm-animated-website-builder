import { useRef, useState } from "react";
import {
  Aperture,
  ArrowLeft,
  Box,
  ChevronDown,
  CirclePlay,
  CloudSun,
  Code2,
  Download,
  Folder,
  Gamepad2,
  Image,
  Layers3,
  Menu,
  Monitor,
  MonitorPlay,
  MousePointer2,
  PanelTop,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Smartphone,
  Upload,
  Video,
  X,
} from "lucide-react";
import { BackgroundRuntime } from "./runtime/WorldCanvas.jsx";
import {
  BACKGROUND_TYPES,
  DEFAULT_PROJECT,
  SCENE_STATES,
  projectSnapshot,
  updateProject,
  validateProject,
} from "./model/project.js";
import { downloadStandaloneSite } from "./export/exportSite.js";

const backgroundOptions = [
  { id: "world", label: "Live world", icon: Sparkles, note: "Procedural canvas" },
  { id: "video", label: "Video", icon: Video, note: "Local media" },
  { id: "image", label: "Asset", icon: Image, note: "Image layer" },
  { id: "game", label: "Browser game", icon: Gamepad2, note: "Interactive canvas" },
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><i /><b /></span>;
}

function RailRow({ icon: Icon, label, active, children, onClick }) {
  return (
    <div className={`rail-row-wrap${active ? " is-active" : ""}`}>
      <button className="rail-row" onClick={onClick} type="button">
        <Icon size={17} strokeWidth={1.7} />
        <span>{label}</span>
        <ChevronDown className="rail-chevron" size={14} />
      </button>
      {children}
    </div>
  );
}

function SubRow({ label, selected, dot, onClick, icon: Icon = Folder }) {
  return (
    <button className={`sub-row${selected ? " is-selected" : ""}`} onClick={onClick} type="button">
      <Icon size={15} strokeWidth={1.6} />
      <span>{label}</span>
      {dot && <i className="status-dot" />}
    </button>
  );
}

function PageOverlay({ project, interactive, onAction }) {
  return (
    <div className={`site-page-layer${interactive ? " is-yielding" : ""}`}>
      {project.page.showNavigation && (
        <nav className="site-nav" aria-label="Published site navigation preview">
          <span className="site-brand"><BrandMark /> AXM</span>
          <div><span>Worlds</span><span>Studio</span><span>About</span></div>
        </nav>
      )}
      <section className="site-hero">
        <div className={`hero-surface surface-${project.page.surface}`}>
          <p>{project.eyebrow}</p>
          <h1>{project.title}</h1>
          <button className="hero-action" onClick={onAction} type="button">
            {project.background.type === "game" ? <Gamepad2 size={17} /> : <Play size={17} />}
            {project.background.type === "game" ? "Enter world" : project.action}
          </button>
        </div>
      </section>
      <footer className="site-footer">
        <span>IDEAS SHAPE WORLDS</span>
        <span>LIVE FRONTEND LAYER</span>
      </footer>
    </div>
  );
}

function Stage({ project, published, interactive, onInteractive, onExit }) {
  const check = validateProject(project);
  return (
    <section className={`stage${published ? " is-published" : ""}${interactive ? " is-interactive" : ""}`} tabIndex={-1}>
      <BackgroundRuntime project={project} interactive={interactive} />
      <div className="stage-vignette" />
      <PageOverlay
        project={project}
        interactive={interactive}
        onAction={() => project.background.type === "game" && onInteractive()}
      />
      {!check.ok && (
        <div className="hold-card" role="status">
          <span>Source hold</span>
          <strong>{check.holds.join(" · ")}</strong>
          <small>Choose a local file to bind this adapter.</small>
        </div>
      )}
      {project.background.type === "game" && !interactive && check.ok && (
        <div className="runtime-chip"><Gamepad2 size={14} /> Game ready · page owns input</div>
      )}
      {interactive && (
        <>
          <div className="game-help"><Gamepad2 size={15} /> Arrow keys pilot the lightcraft</div>
          <button className="exit-world" onClick={onExit} type="button"><MousePointer2 size={16} /> Return control to page</button>
        </>
      )}
    </section>
  );
}

function SceneRail({ project, setProject, uploadRef, isOpen, onClose }) {
  const set = (path, value) => setProject((current) => updateProject(current, path, value));
  const selectBackground = (type) => {
    if (!BACKGROUND_TYPES.includes(type)) return;
    set("background.type", type);
    if (["video", "image"].includes(type)) uploadRef.current?.click();
  };

  return (
    <aside className={`scene-rail${isOpen ? " is-open" : ""}`}>
      <div className="rail-heading">
        <span>Scene layers</span>
        <button className="icon-button mobile-close" onClick={onClose} aria-label="Close scene layers" title="Close scene layers" type="button"><X size={17} /></button>
        <button className="icon-button add-layer" aria-label="Add scene layer" title="Add scene layer" type="button"><Layers3 size={16} /></button>
      </div>
      <div className="rail-scroll">
        <RailRow icon={Box} label="Background" active>
          <div className="adapter-grid">
            {backgroundOptions.map(({ id, label, icon: Icon, note }) => (
              <button key={id} className={project.background.type === id ? "is-selected" : ""} onClick={() => selectBackground(id)} type="button">
                <Icon size={15} /><span>{label}</span><small>{note}</small>
              </button>
            ))}
          </div>
          <SubRow label="World geometry" selected={project.background.type === "world"} />
          <SubRow label="Structures" />
          <SubRow label="Lightcraft" />
          <SubRow label="Environment" />
        </RailRow>

        <RailRow icon={CloudSun} label="Atmosphere">
          <label className="rail-control">
            <span>Atmosphere <b>{project.background.atmosphere}%</b></span>
            <input type="range" min="0" max="100" value={project.background.atmosphere} onChange={(event) => set("background.atmosphere", Number(event.target.value))} />
          </label>
          <SubRow label="Sky gradient" />
          <SubRow label="Fog planes" />
          <SubRow label="Live lighting" />
        </RailRow>

        <RailRow icon={Aperture} label="Camera">
          <SubRow label="Main view" selected />
          <SubRow label="Cinematic shots" />
          <SubRow label="Path animation" />
        </RailRow>

        <RailRow icon={PanelTop} label="Page layer">
          <div className="surface-switch" aria-label="Page surface">
            {["clear", "glass", "solid"].map((surface) => (
              <button className={project.page.surface === surface ? "is-selected" : ""} key={surface} onClick={() => set("page.surface", surface)} type="button">{surface}</button>
            ))}
          </div>
          <SubRow label="Hero" selected dot />
          <SubRow label="Sections" />
          <SubRow label="Navigation" />
          <SubRow label="Media" />
        </RailRow>

        <RailRow icon={Code2} label="Capabilities">
          <SubRow label="Interaction handoff" icon={MousePointer2} />
          <SubRow label="State changes" icon={RotateCcw} />
          <SubRow label="Standalone export" icon={Download} />
        </RailRow>
      </div>
    </aside>
  );
}

function StateStrip({ project, setProject }) {
  return (
    <footer className="state-strip">
      <span className="state-label">Scene state</span>
      <div className="state-cards">
        {Object.entries(SCENE_STATES).map(([id, state]) => (
          <button
            key={id}
            className={`state-card state-${id}${project.background.state === id ? " is-selected" : ""}`}
            onClick={() => setProject((current) => updateProject(current, "background.state", id))}
            type="button"
          >
            <i /><span>{state.label}</span><small>{id === "night" ? "Low light" : `${Math.round(state.speed * 100)}% motion`}</small>
          </button>
        ))}
      </div>
      <div className="quick-tools">
        <button title="Camera" aria-label="Camera settings" type="button"><Aperture size={20} /><span>Camera</span></button>
        <button title="Environment" aria-label="Environment settings" type="button"><CloudSun size={20} /><span>Environment</span></button>
        <button title="Scene settings" aria-label="Scene settings" type="button"><Settings2 size={20} /><span>Scene settings</span></button>
      </div>
    </footer>
  );
}

export function App() {
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [mode, setMode] = useState("edit");
  const [interactive, setInteractive] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [viewport, setViewport] = useState("desktop");
  const [notice, setNotice] = useState("");
  const uploadRef = useRef(null);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };
  const exportSite = () => {
    try {
      downloadStandaloneSite(project);
      showNotice("Standalone presentation downloaded");
    } catch (error) {
      showNotice(error.message);
    }
  };
  const loadMedia = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video/") ? "video" : "image";
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setProject((current) => ({ ...current, background: { ...current.background, type, mediaUrl: String(reader.result) } }));
      showNotice(`${type === "video" ? "Video" : "Image"} bound to the live background`);
    });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const resetProject = () => {
    setProject(DEFAULT_PROJECT);
    setInteractive(false);
    showNotice("Project returned to its verified starting state");
  };

  if (mode === "preview") {
    return (
      <main className={`published-shell is-view-${viewport}`}>
        <Stage project={project} published interactive={interactive} onInteractive={() => setInteractive(true)} onExit={() => setInteractive(false)} />
        {!interactive && (
          <div className="preview-controls">
            <button onClick={() => setMode("edit")} type="button"><ArrowLeft size={17} /> Editor</button>
            <span>Published runtime preview</span>
            <button onClick={() => setViewport((current) => current === "desktop" ? "mobile" : "desktop")} type="button">
              {viewport === "desktop" ? <Smartphone size={17} /> : <Monitor size={17} />}
              {viewport === "desktop" ? "Phone" : "Desktop"}
            </button>
            <button onClick={exportSite} type="button"><Download size={17} /> Export</button>
          </div>
        )}
        {notice && <div className="notice is-visible">{notice}</div>}
      </main>
    );
  }

  return (
    <main className="builder-shell">
      <header className="builder-topbar">
        <button className="icon-button mobile-menu" aria-label="Open scene layers" title="Open scene layers" onClick={() => setRailOpen(true)} type="button"><Menu size={19} /></button>
        <div className="builder-brand"><BrandMark /><strong>AXM</strong><i /><span>Animated Website Builder</span></div>
        <div className="mode-switch" aria-label="Builder view">
          <button className="is-selected" type="button"><Code2 size={15} /> Edit source</button>
          <button onClick={() => setMode("preview")} type="button"><MonitorPlay size={15} /> Published runtime</button>
        </div>
        <button className="topbar-meta" onClick={() => setViewport((current) => current === "desktop" ? "mobile" : "desktop")} title="Toggle desktop and phone canvas" type="button">
          {viewport === "desktop" ? <Monitor size={14} /> : <Smartphone size={14} />}
          <span>{viewport === "desktop" ? "1440 × 1024" : "390 × 844"}</span><i /><span>100%</span>
        </button>
        <div className="topbar-actions">
          <button className="secondary-action" onClick={() => setMode("preview")} type="button"><CirclePlay size={17} /> <span>Preview site</span></button>
          <button className="primary-action" onClick={exportSite} type="button"><Download size={17} /> <span>Export</span></button>
          <button className="icon-button reset-action" onClick={resetProject} aria-label="Reset project" title="Reset project" type="button"><RotateCcw size={17} /></button>
        </div>
      </header>

      <SceneRail project={project} setProject={setProject} uploadRef={uploadRef} isOpen={railOpen} onClose={() => setRailOpen(false)} />
      {railOpen && <button className="rail-backdrop" onClick={() => setRailOpen(false)} aria-label="Close scene layers" type="button" />}

      <div className={`editor-stage-wrap is-view-${viewport}`}>
        <Stage project={project} interactive={interactive} onInteractive={() => setInteractive(true)} onExit={() => setInteractive(false)} />
        <div className="stage-status"><span className="live-dot" /> Live composition <i /> <b>{project.background.type}</b> beneath <b>{project.page.surface} page</b></div>
        <button className="bind-media" onClick={() => uploadRef.current?.click()} type="button"><Upload size={15} /> Bind local media</button>
      </div>
      <StateStrip project={project} setProject={setProject} />

      <input ref={uploadRef} className="visually-hidden" type="file" accept="image/*,video/*" onChange={loadMedia} />
      <output className={`notice${notice ? " is-visible" : ""}`}>{notice}</output>
      <script type="application/json" id="axm-project-snapshot">{projectSnapshot(project)}</script>
    </main>
  );
}
