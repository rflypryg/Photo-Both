import React from "react";

export default function FrameStyleControl({
  frameColors,
  frameColorId,
  setFrameColorId,
  framePatterns,
  patternId,
  setPatternId,
  gridGap,
  setGridGap,
  borderRadius,
  setBorderRadius,
}) {
  return (
    <div className="control-section">
      {/* 1. WARNA FRAME (Grid 6 Kolom Kebawah) */}
      <label className="section-label">Warna Frame</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {frameColors.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`color-btn ${frameColorId === c.id ? "active" : ""}`}
            style={{
              backgroundColor: c.bg,
              border: frameColorId === c.id ? "2px solid #E2B93B" : "1.5px solid rgba(255,255,255,0.2)",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              cursor: "pointer",
            }}
            onClick={() => setFrameColorId(c.id)}
            title={c.name}
          />
        ))}
      </div>

      {/* 2. PATTERN FRAME (Grid 3 Kolom Kebawah) */}
      <label className="section-label">Pattern Frame</label>
      <div className="pattern-row">
        {framePatterns.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip-btn ${patternId === p.id ? "active" : ""}`}
            onClick={() => setPatternId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 3. SLIDER PENGATURAN SPACING */}
      <div className="slider-group" style={{ marginTop: "16px" }}>
        <div className="slider-header">
          <span>Jarak Antar Foto (Gap)</span>
          <span>{gridGap}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          value={gridGap}
          onChange={(e) => setGridGap(Number(e.target.value))}
        />
      </div>

      <div className="slider-group">
        <div className="slider-header">
          <span>Lengkungan Foto (Radius)</span>
          <span>{borderRadius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          value={borderRadius}
          onChange={(e) => setBorderRadius(Number(e.target.value))}
        />
      </div>
    </div>
  );
}