import React from "react";

export default function TemplateControl({ templates, selectedTemplate, onSelectTemplate }) {
  return (
    <div className="control-section">
      <label className="section-label">🎨 PILIH TEMPLATE</label>
      <div className="template-grid">
        <button
          type="button"
          className={`template-btn ${!selectedTemplate ? "active" : ""}`}
          onClick={() => onSelectTemplate(null)}
        >
          <span className="template-label">Polos</span>
          <span className="template-sub">Tanpa overlay template</span>
        </button>

        {templates.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            className={`template-btn ${selectedTemplate?.id === tmpl.id ? "active" : ""}`}
            onClick={() => onSelectTemplate(tmpl)}
          >
            <span className="template-label">{tmpl.name}</span>
            <span className="template-sub">{tmpl.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
