import React, { useState, useRef } from "react";
import "./Edit.css";
import html2canvas from "html2canvas";

const LAYOUTS = [
  { id: "strip-4", label: "Strip" },
  { id: "grid-2x2", label: "2 x 2 Grid" },
  { id: "focus-1", label: "Hero Grid" },
  { id: "collage", label: "Mosaic" },
  { id: "duo-split", label: "Mirror Split" },
  { id: "contact-sheet", label: "Contact Sheet" },
];

const FRAME_COLORS = [
  { id: "frame-white", bg: "#FFFFFF", name: "Classic White" },
  { id: "frame-dark", bg: "#211D1A", name: "Noir" },
  { id: "frame-amber", bg: "#FFF3DC", name: "Amber" },
  { id: "frame-flame", bg: "#FDE3DC", name: "Flame" },
  { id: "frame-sage", bg: "#DCFCE7", name: "Sage" },
  { id: "frame-blush", bg: "#FCE7F3", name: "Blush" },
  { id: "frame-sky", bg: "#DBEAFE", name: "Sky" },
  { id: "frame-kraft", bg: "#EFE0C8", name: "Kraft" },
];

const FILTERS = [
  { id: "none", label: "Original" },
  { id: "bw", label: "B & W" },
  { id: "vintage", label: "Vintage" },
  { id: "cool", label: "Cool" },
  { id: "warm", label: "Warm" },
];

function LayoutIcon({ id }) {
  switch (id) {
    case "strip-4":
      return (
        <div className="icon-preview icon-strip-4">
          <div></div><div></div><div></div><div></div>
        </div>
      );
    case "grid-2x2":
      return (
        <div className="icon-preview icon-grid-2x2">
          <div></div><div></div><div></div><div></div>
        </div>
      );
    case "focus-1":
      return (
        <div className="icon-preview icon-focus-1">
          <div className="big"></div>
          <div className="small-group">
            <div></div><div></div><div></div>
          </div>
        </div>
      );
    case "collage":
      return (
        <div className="icon-preview icon-collage">
          <div className="big-block"></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    case "duo-split":
      return (
        <div className="icon-preview icon-duo-split">
          <div></div><div></div>
        </div>
      );
    case "contact-sheet":
      return (
        <div className="icon-preview icon-contact-sheet">
          <div></div><div></div><div></div>
          <div></div><div></div><div></div>
        </div>
      );
    default:
      return null;
  }
}

function Edit({ photo, back, next }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [filter, setFilter] = useState("none");

  // State Grid & Frame Styling
  const [layoutMode, setLayoutMode] = useState("strip-4");
  const [frameColor, setFrameColor] = useState("frame-white");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Ref langsung ke elemen DOM yang ingin difoto
  const previewRef = useRef(null);

  // Normalisasi data jika photo berupa Array atau Single String
  const photoList = Array.isArray(photo) ? photo : photo ? [photo] : [];

  if (photoList.length === 0) {
    return (
      <div className="edit-page">
        <div className="edit-grain" />
        <div className="edit-corner edit-corner-tl" />
        <div className="edit-corner edit-corner-tr" />
        <div className="edit-corner edit-corner-bl" />
        <div className="edit-corner edit-corner-br" />
        <div className="no-photo-card">
          <h2>📷 No Photo Found</h2>
          <p>Belum ada foto yang diambil dari kamera.</p>
          <button className="back-btn" onClick={back}>
            ← Back to Camera
          </button>
        </div>
      </div>
    );
  }

  // Membuat String CSS Filter untuk Preview & Export
  const getFilterStyle = () => {
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;

    switch (filter) {
      case "bw":
        filterString += " grayscale(100%)";
        break;
      case "vintage":
        filterString += " sepia(60%) hue-rotate(-10deg)";
        break;
      case "cool":
        filterString += " hue-rotate(180deg) saturate(120%)";
        break;
      case "warm":
        filterString += " sepia(30%) saturate(140%)";
        break;
      default:
        break;
    }

    return filterString;
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setFilter("none");
    setLayoutMode("strip-4");
    setFrameColor("frame-white");
  };

  // Tangkap tampilan DOM persis seperti yang ada di layar
  const handleFinishEdit = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const finalImageDataUrl = canvas.toDataURL("image/png");

      next({
        photo: finalImageDataUrl,
        photos: photoList,
        layoutMode,
        frameColor,
        filterSettings: { brightness, contrast, saturate, filter },
      });
    } catch (err) {
      console.error("Gagal memproses gambar dengan html2canvas:", err);
      next(photoList[0]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="edit-page">
      {/* Decorative film layer, consistent with Welcome screen */}
      <div className="edit-grain" />
      <div className="edit-corner edit-corner-tl" />
      <div className="edit-corner edit-corner-tr" />
      <div className="edit-corner edit-corner-bl" />
      <div className="edit-corner edit-corner-br" />

      <div className="edit-sprocket">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`s-${i}`} className="hole" />
        ))}
      </div>

      {/* Header Navigation */}
      <header className="edit-header">
        <button className="back-btn" onClick={back} disabled={isExporting}>
          ← Back
        </button>
        <h2>
          <span>🎞️ Photo Grid &amp; Editor</span>
        </h2>
        <button
          className="confirm-btn"
          onClick={handleFinishEdit}
          disabled={isExporting}
        >
          {isExporting ? "Processing..." : "Continue →"}
        </button>
      </header>

      <div className="edit-container">
        {/* Left Side: Live Photo Strip Preview */}
        <div className="preview-card">
          <div className="preview-hud">
            <span className="dot" /> LIVE PREVIEW
          </div>

          <div
            ref={previewRef}
            className={`photo-strip-frame ${frameColor}`}
          >
            <div className={`grid-layout ${layoutMode}`}>
              {photoList.map((item, idx) => (
                <div
                  key={idx}
                  className={`grid-item item-${idx + 1} ${
                    selectedPhotoIndex === idx ? "selected-item" : ""
                  }`}
                  onClick={() => setSelectedPhotoIndex(idx)}
                >
                  <img
                    src={item}
                    alt={`Photo ${idx + 1}`}
                    style={{ filter: getFilterStyle() }}
                  />
                  <span className="photo-num">{idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Footer Watermark/Branding */}
            <div className="strip-footer">
              <span>PHOTO BOOTH</span>
              <small> • 2026 •</small>
            </div>
          </div>
        </div>

        {/* Right Side: Grid & Adjustment Panel */}
        <div className="editor-panel">
          <div className="panel-header">
            <h3>Layout &amp; Styling</h3>
            <button className="reset-btn" onClick={handleReset}>
              🔄 Reset
            </button>
          </div>

          {/* 1. Pemilihan Layout Grid Foto */}
          <div className="control-section">
            <label className="section-label">Choose Grid Layout</label>
            <div className="layout-grid">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  className={`layout-btn ${
                    layoutMode === l.id ? "active" : ""
                  }`}
                  onClick={() => setLayoutMode(l.id)}
                >
                  <LayoutIcon id={l.id} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pemilihan Warna Frame */}
          <div className="control-section">
            <label className="section-label">Frame Color</label>
            <div className="color-picker-row">
              {FRAME_COLORS.map((c) => (
                <button
                  key={c.id}
                  className={`color-dot ${
                    frameColor === c.id ? "active" : ""
                  }`}
                  style={{ backgroundColor: c.bg }}
                  title={c.name}
                  onClick={() => setFrameColor(c.id)}
                />
              ))}
            </div>
          </div>

          {/* 3. Filter Presets */}
          <div className="control-section">
            <label className="section-label">Presets Filter</label>
            <div className="filter-grid">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`filter-chip ${
                    filter === f.id ? "active" : ""
                  }`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Sliders Adjustments */}
          <div className="control-section">
            <label className="section-label">Adjustments</label>

            <div className="slider-group">
              <div className="slider-header">
                <span>Brightness</span>
                <span className="slider-value">{brightness}%</span>
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
                <span className="slider-value">{contrast}%</span>
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
                <span className="slider-value">{saturate}%</span>
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
        </div>
      </div>
    </div>
  );
}

export default Edit;