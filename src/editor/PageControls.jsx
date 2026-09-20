import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_TRANSITION,
  DEFAULT_VISIBILITY,
  SURFACE_MODES,
  TRANSITION_TYPES,
} from "../model/project.js";

function uniqueSectionId(sections) {
  let number = sections.length + 1;
  let id = `section-${number}`;
  const used = new Set(sections.map((section) => section.id));
  while (used.has(id)) {
    number += 1;
    id = `section-${number}`;
  }
  return id;
}

function Field({ label, children }) {
  return <label className="content-field"><span>{label}</span>{children}</label>;
}

function TransitionControls({ transition, onChange }) {
  return (
    <div className="transition-controls">
      <label>
        <span>Entrance</span>
        <select value={transition.type} onChange={(event) => onChange({ ...transition, type: event.target.value })}>
          {TRANSITION_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}
        </select>
      </label>
      <label>
        <span>Duration <b>{transition.duration}ms</b></span>
        <input type="range" min="0" max="1800" step="50" value={transition.duration} onChange={(event) => onChange({ ...transition, duration: Number(event.target.value) })} />
      </label>
      <label>
        <span>Delay <b>{transition.delay}ms</b></span>
        <input type="range" min="0" max="1000" step="50" value={transition.delay} onChange={(event) => onChange({ ...transition, delay: Number(event.target.value) })} />
      </label>
    </div>
  );
}

export function PageControls({ project, dispatch }) {
  const sections = project.page.sections || [];
  const navigation = project.page.navigation || [];

  const set = (path, value, label) => dispatch([{ type: "set", payload: { path, value } }], label || `Set ${path}`);
  const updateSection = (id, patch, label = "Edit section") => dispatch([
    { type: "section.update", payload: { id, patch } },
  ], label);

  const addSection = () => {
    const id = uniqueSectionId(sections);
    dispatch([
      {
        type: "section.add",
        payload: {
          section: {
            id,
            eyebrow: "NEW SECTION",
            title: "Shape this section",
            body: "Describe what this part of the site should communicate.",
            surface: "glass",
            points: [],
            transition: { ...DEFAULT_TRANSITION },
            visibility: { ...DEFAULT_VISIBILITY },
          },
        },
      },
      {
        type: "navigation.add",
        payload: { item: { label: `Section ${sections.length + 1}`, href: `#${id}` } },
      },
    ], "Add section");
  };

  const removeSection = (id) => dispatch([{ type: "section.remove", payload: { id } }], "Remove section");
  const moveSection = (id, toIndex) => dispatch([{ type: "section.move", payload: { id, toIndex } }], "Move section");
  const updateNavigation = (index, patch) => dispatch([{ type: "navigation.update", payload: { index, patch } }], "Edit navigation");
  const addNavigation = () => dispatch([{ type: "navigation.add", payload: { item: { label: "Link", href: "#" } } }], "Add navigation");
  const removeNavigation = (index) => dispatch([{ type: "navigation.remove", payload: { index } }], "Remove navigation");

  return (
    <div className="content-editor">
      <div className="content-editor-group">
        <div className="content-editor-title"><span>Hero content</span></div>
        <Field label="Eyebrow"><input value={project.eyebrow} onChange={(event) => set("eyebrow", event.target.value, "Edit hero eyebrow")} /></Field>
        <Field label="Title"><textarea rows="2" value={project.title} onChange={(event) => set("title", event.target.value, "Edit hero title")} /></Field>
        <Field label="Action"><input value={project.action} onChange={(event) => set("action", event.target.value, "Edit hero action")} /></Field>
        <Field label="Hero note"><textarea rows="3" value={project.page.heroNote || ""} onChange={(event) => set("page.heroNote", event.target.value, "Edit hero note")} /></Field>
        <TransitionControls
          transition={project.page.heroTransition}
          onChange={(transition) => dispatch([{ type: "hero.configure", payload: { transition } }], "Edit hero entrance")}
        />
      </div>

      <div className="content-editor-group">
        <div className="content-editor-title">
          <span>Sections · {sections.length}</span>
          <button type="button" onClick={addSection} title="Add section" aria-label="Add section"><Plus size={14} /></button>
        </div>
        {sections.map((section, index) => (
          <article className="section-editor-card" key={section.id}>
            <div className="section-editor-head">
              <strong>{index + 1}. {section.title || section.id}</strong>
              <span>{section.id}</span>
              <div>
                <button type="button" onClick={() => moveSection(section.id, index - 1)} disabled={index === 0} aria-label="Move section up"><ArrowUp size={13} /></button>
                <button type="button" onClick={() => moveSection(section.id, index + 1)} disabled={index === sections.length - 1} aria-label="Move section down"><ArrowDown size={13} /></button>
                <button type="button" onClick={() => removeSection(section.id)} aria-label="Remove section"><Trash2 size={13} /></button>
              </div>
            </div>
            <Field label="Eyebrow"><input value={section.eyebrow || ""} onChange={(event) => updateSection(section.id, { eyebrow: event.target.value }, "Edit section eyebrow")} /></Field>
            <Field label="Title"><textarea rows="2" value={section.title || ""} onChange={(event) => updateSection(section.id, { title: event.target.value }, "Edit section title")} /></Field>
            <Field label="Body"><textarea rows="4" value={section.body || ""} onChange={(event) => updateSection(section.id, { body: event.target.value }, "Edit section body")} /></Field>
            <Field label="Points · one per line">
              <textarea rows="4" value={(section.points || []).join("\n")} onChange={(event) => updateSection(section.id, {
                points: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
              }, "Edit section points")} />
            </Field>
            <div className="mini-surface-switch" aria-label={`Surface for ${section.id}`}>
              {SURFACE_MODES.map((surface) => (
                <button className={(section.surface || "clear") === surface ? "is-selected" : ""} key={surface} onClick={() => updateSection(section.id, { surface }, "Set section surface")} type="button">
                  {surface}
                </button>
              ))}
            </div>
            <TransitionControls transition={section.transition} onChange={(transition) => updateSection(section.id, { transition }, "Edit section entrance")} />
            <div className="responsive-toggles">
              <label><input type="checkbox" checked={section.visibility.desktop} onChange={(event) => updateSection(section.id, { visibility: { ...section.visibility, desktop: event.target.checked } }, "Set section desktop visibility")} /> Desktop</label>
              <label><input type="checkbox" checked={section.visibility.mobile} onChange={(event) => updateSection(section.id, { visibility: { ...section.visibility, mobile: event.target.checked } }, "Set section phone visibility")} /> Phone</label>
            </div>
          </article>
        ))}
      </div>

      <div className="content-editor-group">
        <div className="content-editor-title">
          <span>Navigation · {navigation.length}</span>
          <button type="button" onClick={addNavigation} title="Add navigation item" aria-label="Add navigation item"><Plus size={14} /></button>
        </div>
        <label className="content-toggle">
          <input checked={project.page.showNavigation} onChange={(event) => set("page.showNavigation", event.target.checked, "Toggle navigation")} type="checkbox" />
          <span>Show navigation</span>
        </label>
        {navigation.map((item, index) => (
          <div className="navigation-editor-row" key={`${index}-${item.href}`}>
            <input aria-label={`Navigation label ${index + 1}`} value={item.label} onChange={(event) => updateNavigation(index, { label: event.target.value })} />
            <input aria-label={`Navigation target ${index + 1}`} value={item.href} onChange={(event) => updateNavigation(index, { href: event.target.value })} />
            <button type="button" onClick={() => removeNavigation(index)} aria-label="Remove navigation item"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      <div className="content-editor-group">
        <div className="content-editor-title"><span>Footer</span></div>
        <Field label="Left"><input value={project.page.footer?.left || ""} onChange={(event) => set("page.footer.left", event.target.value, "Edit footer left")} /></Field>
        <Field label="Right"><input value={project.page.footer?.right || ""} onChange={(event) => set("page.footer.right", event.target.value, "Edit footer right")} /></Field>
      </div>
    </div>
  );
}
