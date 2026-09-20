import { useState } from "react";
import { Bot, Download, Play, RefreshCcw, UserRound } from "lucide-react";

function exampleBatch(revision) {
  return JSON.stringify({
    format: "axm-builder-command-batch",
    version: 1,
    baseRevision: revision,
    actor: { type: "ai", id: "website-designer" },
    label: "AI website pass",
    commands: [
      {
        type: "background.configure",
        payload: { state: "explore", atmosphere: 78, motion: true },
      },
      {
        type: "hero.configure",
        payload: {
          eyebrow: "AI + HUMAN WEBSITE",
          title: "A living site shaped through one shared contract.",
          action: "Explore",
          surface: "clear",
        },
      },
    ],
  }, null, 2);
}

export function CollaborationPanel({ session, onApplyAiBatch, onExportSession }) {
  const [draft, setDraft] = useState("");

  const fillExample = () => setDraft(exampleBatch(session.revision));

  return (
    <div className="collaboration-panel">
      <div className="collaboration-head">
        <div>
          <span>Shared session</span>
          <strong>revision {session.revision}</strong>
        </div>
        <button type="button" onClick={onExportSession} title="Export AI context"><Download size={13} /></button>
      </div>

      <p className="collaboration-note">Human controls and AI batches change the same project state. A stale AI batch is held instead of overwriting newer human work.</p>

      <textarea
        className="ai-batch-input"
        rows="8"
        placeholder="Paste an axm-builder-command-batch JSON here…"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />

      <div className="collaboration-actions">
        <button type="button" onClick={fillExample}><RefreshCcw size={13} /> Example</button>
        <button
          type="button"
          className="apply-ai"
          disabled={!draft.trim()}
          onClick={() => onApplyAiBatch(draft)}
        >
          <Play size={13} /> Apply AI batch
        </button>
      </div>

      <div className="session-log">
        <span className="session-log-title">Recent changes</span>
        {session.log.length === 0 && <small>No shared-session changes yet.</small>}
        {session.log.slice(-8).reverse().map((entry) => (
          <div className="session-log-row" key={entry.batchId}>
            {entry.actor.type === "ai" ? <Bot size={12} /> : <UserRound size={12} />}
            <b>r{entry.revision}</b>
            <span>{entry.label || entry.commandTypes.join(" + ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
