import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { SURFACE_MODES, updateProject } from "../model/project.js";

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

export function PageControls({ project, setProject }) {
  const sections = project.page.sections || [];
  const navigation = project.page.navigation || [];

  const set = (path, value) => setProject((current) => updateProject(current, path, value));
  const setPage = (patch) => setProject((current) => ({
    ...current,
    page: { ...current.page, ...patch },
  }));

  const updateSection = (index, patch) => {
    const next = sections.map((section, itemIndex) => itemIndex === index ? { ...section, ...patch } : section);
    setPage({ sections: next });
  };

  const addSection = () => {
    const id = uniqueSectionId(sections);
    const nextSection = {
      id,
      eyebrow: "NEW SECTION",
      title: "Shape this section",
      body: "Describe what this part of the site should communicate.",
      surface: "glass",
      points: [],
    };
    setPage({
      sections: [...sections, nextSection],
      navigation: [...navigation, { label: `Section ${sections.length + 1}`, href: `#${id}` }],
    });
  };

  const removeSection = (index) => {
    const target = sections[index];
    setPage({
      sections: sections.filter((_, itemIndex) => itemIndex !== index),
      navigation: navigation.filter((item) => item.href !== `#${target.id}`),
    });
  };

  const moveSection = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setPage({ sections: next });
  };

  const updateNavigation = (index, patch) => {
    setPage({
      navigation: navigation.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    });
  };

  const addNavigation = () => {
    setPage({ navigation: [...navigation, { label: "Link", href: "#" }] });
  };

  const removeNavigation = (index) => {
    setPage({ navigation: navigation.filter((_, itemIndex) => itemIndex !== index) });
  };

  return (
    <div className="content-editor">
      <div className="content-editor-group">
        <div className="content-editor-title"><span>Hero content</span></div>
        <Field label="Eyebrow"><input value={project.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} /></Field>
        <Field label="Title"><textarea rows="2" value={project.title} onChange={(event) => set("title", event.target.value)} /></Field>
        <Field label="Action"><input value={project.action} onChange={(event) => set("action", event.target.value)} /></Field>
        <Field label="Hero note"><textarea rows="3" value={project.page.heroNote || ""} onChange={(event) => set("page.heroNote", event.target.value)} /></Field>
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
                <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label="Move section up"><ArrowUp size={13} /></button>
                <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} aria-label="Move section down"><ArrowDown size={13} /></button>
                <button type="button" onClick={() => removeSection(index)} aria-label="Remove section"><Trash2 size={13} /></button>
              </div>
            </div>
            <Field label="Eyebrow"><input value={section.eyebrow || ""} onChange={(event) => updateSection(index, { eyebrow: event.target.value })} /></Field>
            <Field label="Title"><textarea rows="2" value={section.title || ""} onChange={(event) => updateSection(index, { title: event.target.value })} /></Field>
            <Field label="Body"><textarea rows="4" value={section.body || ""} onChange={(event) => updateSection(index, { body: event.target.value })} /></Field>
            <Field label="Points · one per line">
              <textarea
                rows="4"
                value={(section.points || []).join("\n")}
                onChange={(event) => updateSection(index, {
                  points: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                })}
              />
            </Field>
            <div className="mini-surface-switch" aria-label={`Surface for ${section.id}`}>
              {SURFACE_MODES.map((surface) => (
                <button
                  className={(section.surface || "clear") === surface ? "is-selected" : ""}
                  key={surface}
                  onClick={() => updateSection(index, { surface })}
                  type="button"
                >
                  {surface}
                </button>
              ))}
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
          <input
            checked={project.page.showNavigation}
            onChange={(event) => set("page.showNavigation", event.target.checked)}
            type="checkbox"
          />
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
        <Field label="Left"><input value={project.page.footer?.left || ""} onChange={(event) => setPage({ footer: { ...project.page.footer, left: event.target.value } })} /></Field>
        <Field label="Right"><input value={project.page.footer?.right || ""} onChange={(event) => setPage({ footer: { ...project.page.footer, right: event.target.value } })} /></Field>
      </div>
    </div>
  );
}
