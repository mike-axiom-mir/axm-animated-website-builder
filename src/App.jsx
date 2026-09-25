import { useEffect, useRef, useState } from "react";
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
  Save,
  FileUp,
  Settings2,
  Sparkles,
  Smartphone,
  Upload,
  Video,
  X,
} from "lucide-react";
import { BackgroundRuntime } from "./runtime/WorldCanvas.jsx";
import { AnimatedReveal } from "./runtime/AnimatedReveal.jsx";
import {
  BACKGROUND_TYPES,
  SCENE_STATES,
  buildProjectFile,
  parseProjectFile,
  projectSnapshot,
  validateProject,
} from "./model/project.js";
import { downloadStandaloneSite } from "./export/exportSite.js";
import {
  applyBuilderBatch,
  builderSessionSnapshot,
  createBuilderBatch,
  createBuilderSession,
  parseBuilderBatch,
} from "./contract/builderSession.js";
import { CollaborationPanel } from "./editor/CollaborationPanel.jsx";
import { PageControls } from "./editor/PageControls.jsx";
import { SceneMotionControls } from "./editor/SceneMotionControls.jsx";
import { AXM_FRONT_DOOR_PROJECT } from "./projects/axmFrontDoor.js";

const backgroundOptions = [
  { id: "world", label: "Live world", icon: Sparkles, note: "Procedural canvas" },
  { id: "video", label: "Video", icon: Video, note: "Local media" },
  { id: "image", label: "Asset", icon: Image, note: "Image layer" },
  { id: "game", label: "Browser game", icon: Gamepad2, note: "Interactive canvas" },
];

function projectFilename(project) {
  const base = project.metadata?.projectId || project.title || "axm-animated-site";
  const slug = String(base).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "axm-animated-site";
  return `${slug}.axm.json`;
}

function downloadTextFile(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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

function PageOverlay({ project, interactive, onAction, onSceneTargetChange }) {
  const navigation = project.page.navigation || [];
  const sections = project.page.sections || [];
  const firstSection = sections[0]?.id ? `#${sections[0].id}` : "#";
  const footer = project.page.footer || {};
  const layerRef = useRef(null);

  useEffect(() => {
    const root = layerRef.current;
    if (!root || !project.page.choreography?.enabled) {
      onSceneTargetChange?.("hero");
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rootRect = root.getBoundingClientRect();
      const focusY = rootRect.top + root.clientHeight * 0.46;
      const targets = [...root.querySelectorAll("[data-scene-target]")].filter((node) => {
        const style = getComputedStyle(node);
        return style.display !== "none";
      });
      let best = targets[0];
      let bestDistance = Infinity;
      for (const node of targets) {
        const rect = node.getBoundingClientRect();
        const center = (rect.top + rect.bottom) * 0.5;
        const distance = Math.abs(center - focusY);
        if (distance < bestDistance) {
          best = node;
          bestDistance = distance;
        }
      }
      onSceneTargetChange?.(best?.dataset.sceneTarget || "hero");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    root.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      root.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [project.page.choreography?.enabled, sections, onSceneTargetChange]);

  return (
    <div ref={layerRef} className={`site-page-layer${interactive ? " is-yielding" : ""}`}>
      {project.page.showNavigation && (
        <nav className="site-nav" aria-label="Published site navigation preview">
          <a className="site-brand" href="#"><BrandMark /> AXM</a>
          <div>{navigation.map((item) => <a href={item.href} key={`${item.href}-${item.label}`}>{item.label}</a>)}</div>
        </nav>
      )}
      <section className="site-hero" data-scene-target="hero">
        <AnimatedReveal className={`hero-surface surface-${project.page.surface}`} transition={project.page.heroTransition}>
          <p>{project.eyebrow}</p>
          <h1>{project.title}</h1>
          {project.background.type === "game"
            ? <button className="hero-action" onClick={onAction} type="button"><Gamepad2 size={17} /> Enter world</button>
            : <a className="hero-action" href={firstSection}><Play size={17} /> {project.action}</a>}
          {project.page.heroNote && <small className="hero-note">{project.page.heroNote}</small>}
        </AnimatedReveal>
      </section>
      {sections.length > 0 && (
        <div className="site-sections">
          {sections.map((section) => {
            const visibility = [
              section.visibility?.desktop === false ? " section-desktop-off" : "",
              section.visibility?.mobile === false ? " section-mobile-off" : "",
            ].join("");
            return (
              <AnimatedReveal as="section" className={`site-section surface-${section.surface || "clear"}${visibility}`} id={section.id} key={section.id} transition={section.transition} data-scene-target={section.id}>
                <div className="section-label"><span>{section.eyebrow}</span><i /></div>
                <div className="section-copy">
                  <h2>{section.title}</h2><p>{section.body}</p>
                  {section.points?.length > 0 && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
                  {section.links?.length > 0 && <div className="section-links">{section.links.map((link) => <a className="section-link" href={link.href} key={`${link.href}-${link.label}`} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>{link.label} <span aria-hidden="true">↗</span></a>)}</div>}
                </div>
              </AnimatedReveal>
            );
          })}
        </div>
      )}
      <footer className="site-footer"><span>{footer.left || "IDEAS SHAPE WORLDS"}</span><span>{footer.right || "LIVE FRONTEND LAYER"}</span></footer>
    </div>
  );
}

function Stage({ project, published, interactive, onInteractive, onExit }) {
  const check = validateProject(project);
  const [sceneTarget, setSceneTarget] = useState("hero");
  const section = project.page.sections.find((item) => item.id === sceneTarget);
  const sceneCue = sceneTarget === "hero" ? project.page.heroSceneCue : section?.sceneCue || project.page.heroSceneCue;

  return (
    <section className={`stage${published ? " is-published" : ""}${interactive ? " is-interactive" : ""}`} tabIndex={-1}>
      <BackgroundRuntime project={project} interactive={interactive} sceneCue={sceneCue} />
      <div className="stage-vignette" />
      <PageOverlay project={project} interactive={interactive} onSceneTargetChange={setSceneTarget} onAction={() => project.background.type === "game" && onInteractive()} />
      {!check.ok && <div className="hold-card" role="status"><span>Source hold</span><strong>{check.holds.join(" · ")}</strong><small>Resolve the project hold before publishing.</small></div>}
      {project.page.choreography?.enabled && check.ok && <div className="choreography-chip">scene · {sceneTarget}</div>}
      {project.background.type === "game" && !interactive && check.ok && <div className="runtime-chip"><Gamepad2 size={14} /> Game ready · page owns input</div>}
      {interactive && <>
        <div className="game-help"><Gamepad2 size={15} /> Arrow keys pilot the lightcraft</div>
        <button className="exit-world" onClick={onExit} type="button"><MousePointer2 size={16} /> Return control to page</button>
      </>}
    </section>
  );
}

function SceneRail({ project, session, dispatchHuman, onApplyAiBatch, onExportSession, uploadRef, isOpen, onClose }) {
  const set = (path, value, label) => dispatchHuman([{ type: "set", payload: { path, value } }], label || `Set ${path}`);
  const selectBackground = (type) => {
    if (!BACKGROUND_TYPES.includes(type)) return;
    set("background.type", type, "Change background adapter");
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
            <input type="range" min="0" max="100" value={project.background.atmosphere} onChange={(event) => set("background.atmosphere", Number(event.target.value), "Adjust atmosphere")} />
          </label>
          <SubRow label="Sky gradient" />
          <SubRow label="Fog planes" />
          <SubRow label="Live lighting" />
        </RailRow>

        <RailRow icon={Sparkles} label="Motion fabric">
          <SceneMotionControls project={project} dispatch={dispatchHuman} />
        </RailRow>

        <RailRow icon={Aperture} label="Camera">
          <SubRow label="Main view" selected />
          <SubRow label="Cinematic shots" />
          <SubRow label="Path animation" />
        </RailRow>

        <RailRow icon={PanelTop} label="Page layer">
          <label className="content-toggle choreography-toggle">
            <input checked={project.page.choreography?.enabled} onChange={(event) => dispatchHuman([{ type: "choreography.configure", payload: { enabled: event.target.checked } }], "Toggle section choreography")} type="checkbox" />
            <span>Section choreography</span>
          </label>
          <div className="surface-switch" aria-label="Page surface">
            {["clear", "glass", "solid"].map((surface) => (
              <button className={project.page.surface === surface ? "is-selected" : ""} key={surface} onClick={() => set("page.surface", surface, "Set hero surface")} type="button">{surface}</button>
            ))}
          </div>
          <PageControls project={project} dispatch={dispatchHuman} />
        </RailRow>

        <RailRow icon={Code2} label="Capabilities">
          <SubRow label="Interaction handoff" icon={MousePointer2} />
          <SubRow label="State changes" icon={RotateCcw} />
          <SubRow label="Standalone export" icon={Download} />
          <CollaborationPanel
            session={session}
            onApplyAiBatch={onApplyAiBatch}
            onExportSession={onExportSession}
          />
        </RailRow>
      </div>
    </aside>
  );
}

function StateStrip({ project, dispatchHuman }) {
  return (
    <footer className="state-strip">
      <span className="state-label">Scene state</span>
      <div className="state-cards">
        {Object.entries(SCENE_STATES).map(([id, state]) => (
          <button
            key={id}
            className={`state-card state-${id}${project.background.state === id ? " is-selected" : ""}`}
            onClick={() => dispatchHuman([
              { type: "set", payload: { path: "background.state", value: id } },
            ], `Set scene state · ${state.label}`)}
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
  const [session, setSession] = useState(() => createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "browser-session" }));
  const [mode, setMode] = useState("edit");
  const [interactive, setInteractive] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [viewport, setViewport] = useState("desktop");
  const [notice, setNotice] = useState("");
  const [sourceReceipt, setSourceReceipt] = useState(null);
  const uploadRef = useRef(null);
  const projectOpenRef = useRef(null);
  const project = session.project;

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const dispatchHuman = (commands, label = "Human edit") => {
    const batch = createBuilderBatch(session, {
      actor: { type: "human", id: "local-user" },
      label,
      commands,
    });
    const result = applyBuilderBatch(session, batch);
    if (!result.ok) {
      showNotice(result.holds.join(" · "));
      return false;
    }
    setSession(result.session);
    return true;
  };

  const applyAiBatchText = (text) => {
    try {
      const batch = parseBuilderBatch(text);
      if (batch.actor?.type !== "ai") {
        showNotice("HOLD_AI_BATCH_ACTOR_REQUIRED");
        return;
      }
      const result = applyBuilderBatch(session, batch);
      if (!result.ok) {
        const conflict = result.holds.includes("HOLD_SESSION_REVISION_CONFLICT")
          ? ` · expected r${result.expectedRevision}, received r${result.receivedRevision}`
          : "";
        showNotice(`${result.holds.join(" · ")}${conflict}`);
        return;
      }
      setSession(result.session);
      showNotice(`AI batch applied · revision ${result.session.revision}`);
    } catch (error) {
      showNotice(error.message);
    }
  };

  const exportSession = () => {
    downloadTextFile(
      `axm-builder-session-r${session.revision}.json`,
      builderSessionSnapshot(session),
    );
    showNotice(`Session context exported · revision ${session.revision}`);
  };

  const exportSite = () => {
    try {
      downloadStandaloneSite(project);
      showNotice("Standalone presentation downloaded");
    } catch (error) {
      showNotice(error.message);
    }
  };

  const saveProject = async () => {
    try {
      const saved = await buildProjectFile(project);
      const filename = projectFilename(project);
      downloadTextFile(filename, saved.text);
      setSourceReceipt({ ...saved.receipt, sourceName: filename });
      showNotice(`Project saved · ${saved.receipt.sha256.slice(0, 12)}`);
    } catch (error) {
      showNotice(error.message);
    }
  };

  const openProject = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const opened = await parseProjectFile(await file.text(), { sourceName: file.name });
      setSession(createBuilderSession(opened.project, { sessionId: "browser-session" }));
      setInteractive(false);
      setSourceReceipt(opened.receipt);
      const migrationNote = opened.receipt.migrations.length ? ` · migrated ${opened.receipt.migrations.join(", ")}` : "";
      showNotice(`Project opened · ${opened.receipt.sha256.slice(0, 12)}${migrationNote}`);
    } catch (error) {
      showNotice(error.message);
    } finally {
      event.target.value = "";
    }
  };

  const loadMedia = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video/") ? "video" : "image";
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const batch = createBuilderBatch(session, {
        actor: { type: "human", id: "local-user" },
        label: `Bind ${type} media`,
        commands: [{
          type: "background.configure",
          payload: { type, mediaUrl: String(reader.result) },
        }],
      });
      const result = applyBuilderBatch(session, batch);
      if (!result.ok) {
        showNotice(result.holds.join(" · "));
        return;
      }
      setSession(result.session);
      showNotice(`${type === "video" ? "Video" : "Image"} bound to the live background`);
    });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const resetProject = () => {
    setSession(createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "browser-session" }));
    setInteractive(false);
    setSourceReceipt(null);
    showNotice("Front door restored to its project baseline");
  };

  if (mode === "preview") {
    return (
      <main className={`published-shell is-view-${viewport}`}>
        <Stage project={project} published interactive={interactive} onInteractive={() => setInteractive(true)} onExit={() => setInteractive(false)} />
        {!interactive && (
          <div className="preview-controls">
            <button onClick={() => setMode("edit")} type="button"><ArrowLeft size={17} /> Editor</button>
            <span>Published runtime preview · r{session.revision}</span>
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
          <span>{viewport === "desktop" ? "1440 × 1024" : "390 × 844"}</span><i /><span>r{session.revision}</span>
        </button>
        <div className="topbar-actions">
          <button className="secondary-action" onClick={() => setMode("preview")} type="button"><CirclePlay size={17} /> <span>Preview site</span></button>
          <button className="icon-button project-file-action" onClick={saveProject} aria-label="Save builder project" title="Save builder project" type="button"><Save size={17} /></button>
          <button className="icon-button project-file-action" onClick={() => projectOpenRef.current?.click()} aria-label="Open builder project" title="Open builder project" type="button"><FileUp size={17} /></button>
          <button className="primary-action" onClick={exportSite} type="button"><Download size={17} /> <span>Export</span></button>
          <button className="icon-button reset-action" onClick={resetProject} aria-label="Reset project" title="Reset project" type="button"><RotateCcw size={17} /></button>
        </div>
      </header>

      <SceneRail
        project={project}
        session={session}
        dispatchHuman={dispatchHuman}
        onApplyAiBatch={applyAiBatchText}
        onExportSession={exportSession}
        uploadRef={uploadRef}
        isOpen={railOpen}
        onClose={() => setRailOpen(false)}
      />
      {railOpen && <button className="rail-backdrop" onClick={() => setRailOpen(false)} aria-label="Close scene layers" type="button" />}

      <div className={`editor-stage-wrap is-view-${viewport}`}>
        <Stage project={project} interactive={interactive} onInteractive={() => setInteractive(true)} onExit={() => setInteractive(false)} />
        <div className="stage-status">
          <span className="live-dot" /> Live composition <i /> <b>{project.background.type}</b> beneath <b>{project.page.surface} page</b><i /><span>r{session.revision}</span>
          {sourceReceipt && <><i /><span title={sourceReceipt.sha256}>source {sourceReceipt.sha256.slice(0, 8)}</span></>}
        </div>
        <button className="bind-media" onClick={() => uploadRef.current?.click()} type="button"><Upload size={15} /><span>Bind local media</span></button>
      </div>
      <StateStrip project={project} dispatchHuman={dispatchHuman} />

      <input ref={uploadRef} className="visually-hidden" type="file" accept="image/*,video/*" onChange={loadMedia} />
      <input ref={projectOpenRef} className="visually-hidden" type="file" accept=".json,.axm.json,application/json" onChange={openProject} />
      <output className={`notice${notice ? " is-visible" : ""}`}>{notice}</output>
      <script type="application/json" id="axm-project-snapshot">{projectSnapshot(project)}</script>
    </main>
  );
}