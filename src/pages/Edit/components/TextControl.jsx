import React from "react";

export default function TextControl({
  customTitle,
  setCustomTitle,
  customSubtitle,
  setCustomSubtitle,
}) {
  return (
    <div className="control-section">
      <label className="section-label">Teks Watermark Frame</label>
      <input
        type="text"
        className="input-text"
        placeholder="Judul Utama"
        value={customTitle}
        onChange={(e) => setCustomTitle(e.target.value)}
      />
      <input
        type="text"
        className="input-text"
        placeholder="Sub-Judul"
        value={customSubtitle}
        onChange={(e) => setCustomSubtitle(e.target.value)}
      />
    </div>
  );
}