import React from "react";

export default function FilterControl({
  filters,
  filter,
  setFilter,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturate,
  setSaturate,
}) {
  const handleResetManual = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
  };

  return (
    <>
      <div className="control-section">
        <label className="section-label">Filter Warna</label>
        {/* Menggunakan layout grid memanjang ke bawah */}
        <div className="filter-grid">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="section-label">Pengaturan Manual Foto</label>
          <button
            type="button"
            onClick={handleResetManual}
            style={{
              background: "none",
              border: "none",
              color: "var(--amber)",
              fontSize: "0.7rem",
              fontFamily: "Space Mono, monospace",
              cursor: "pointer",
              padding: "0",
              textDecoration: "underline",
            }}
          >
            Reset
          </button>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span>Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span>Contrast</span>
            <span>{contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span>Saturation</span>
            <span>{saturate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={saturate}
            onChange={(e) => setSaturate(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}