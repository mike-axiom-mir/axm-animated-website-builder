import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  ELEMENT_MOTIONS,
  ELEMENT_TONES,
  MOTION_PROFILES,
  SCENE_ELEMENT_TYPES,
} from "../model/project.js";

function uniqueElementId(elements) {
  let number = elements.length + 1;
  let id = `atom-${number}`;
  const used = new Set(elements.map((element) => element.id));
  while (used.has(id)) {
    number += 1;
    id = `atom-${number}`;
  }
  return id;
}

function RangeField({ label, value, min, max, step, onChange }) {
  return (
    <label className="motion-range">
      <span>{label}<b>{Number(value).toFixed(step < 0.1 ? 2 : 1)}</b></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function SceneMotionControls({ project, dispatch }) {
  const elements = project.background.sceneElements || [];

  const motion = (payload, label) => dispatch([{ type: "motion.configure", payload }], label);
  const updateElement = (id, patch, label = "Edit scene atom") => dispatch([
    { type: "scene.element.update", payload: { id, patch } },
  ], label);

  const addElement = () => {
    const id = uniqueElementId(elements);
    dispatch([{
      type: "scene.element.add",
      payload: {
        element: {
          id,
          type: "orb",
          x: 0.72,
          y: 0.32,
          size: 0.08,
          opacity: 0.7,
          motion: "float",
          speed: 1,
          phase: 0,
          tone: "accent",
          visibility: { desktop: true, mobile: true },
        },
      },
    }], "Add scene atom");
  };

  const removeElement = (id) => dispatch([{ type: "scene.element.remove", payload: { id } }], "Remove scene atom");
  const moveElement = (id, toIndex) => dispatch([{ type: "scene.element.move", payload: { id, toIndex } }], "Move scene atom");

  return (
    <div className="motion-editor">
      <div className="motion-profile-grid">
        {Object.entries(MOTION_PROFILES).map(([id, profile]) => (
          <button
            className={project.background.motionProfile === id ? "is-selected" : ""}
            key={id}
            onClick={() => motion({ profile: id }, `Motion profile · ${profile.label}`)}
            type="button"
          >
            {profile.label}
          </button>
        ))}
      </div>
      <RangeField
        label="Motion scale"
        value={project.background.motionScale}
        min={0}
        max={3}
        step={0.1}
        onChange={(value) => motion({ scale: value }, "Adjust motion scale")}
      />
      <label className="content-toggle motion-toggle">
        <input checked={project.background.motion} onChange={(event) => motion({ enabled: event.target.checked }, "Toggle motion")} type="checkbox" />
        <span>Run animation</span>
      </label>

      <div className="content-editor-title motion-elements-title">
        <span>Scene atoms · {elements.length}</span>
        <button type="button" onClick={addElement} title="Add scene atom" aria-label="Add scene atom"><Plus size={14} /></button>
      </div>

      {elements.map((element, index) => (
        <article className="motion-element-card" key={element.id}>
          <div className="section-editor-head">
            <strong>{element.id}</strong>
            <span>{element.type}</span>
            <div>
              <button type="button" onClick={() => moveElement(element.id, index - 1)} disabled={index === 0} aria-label="Move atom up"><ArrowUp size={13} /></button>
              <button type="button" onClick={() => moveElement(element.id, index + 1)} disabled={index === elements.length - 1} aria-label="Move atom down"><ArrowDown size={13} /></button>
              <button type="button" onClick={() => removeElement(element.id)} aria-label="Remove atom"><Trash2 size={13} /></button>
            </div>
          </div>

          <div className="motion-select-row">
            <label><span>Type</span><select value={element.type} onChange={(event) => updateElement(element.id, { type: event.target.value }, "Change atom type")}>
              {SCENE_ELEMENT_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}
            </select></label>
            <label><span>Motion</span><select value={element.motion} onChange={(event) => updateElement(element.id, { motion: event.target.value }, "Change atom motion")}>
              {ELEMENT_MOTIONS.map((motionId) => <option value={motionId} key={motionId}>{motionId}</option>)}
            </select></label>
            <label><span>Tone</span><select value={element.tone} onChange={(event) => updateElement(element.id, { tone: event.target.value }, "Change atom tone")}>
              {ELEMENT_TONES.map((tone) => <option value={tone} key={tone}>{tone}</option>)}
            </select></label>
          </div>

          <RangeField label="X" value={element.x} min={0} max={1} step={0.01} onChange={(value) => updateElement(element.id, { x: value })} />
          <RangeField label="Y" value={element.y} min={0} max={1} step={0.01} onChange={(value) => updateElement(element.id, { y: value })} />
          <RangeField label="Size" value={element.size} min={0.02} max={0.3} step={0.01} onChange={(value) => updateElement(element.id, { size: value })} />
          <RangeField label="Speed" value={element.speed} min={0} max={4} step={0.1} onChange={(value) => updateElement(element.id, { speed: value })} />
          <RangeField label="Opacity" value={element.opacity} min={0} max={1} step={0.05} onChange={(value) => updateElement(element.id, { opacity: value })} />

          <div className="responsive-toggles">
            <label><input type="checkbox" checked={element.visibility.desktop} onChange={(event) => updateElement(element.id, { visibility: { ...element.visibility, desktop: event.target.checked } }, "Set atom desktop visibility")} /> Desktop</label>
            <label><input type="checkbox" checked={element.visibility.mobile} onChange={(event) => updateElement(element.id, { visibility: { ...element.visibility, mobile: event.target.checked } }, "Set atom phone visibility")} /> Phone</label>
          </div>
        </article>
      ))}
    </div>
  );
}
