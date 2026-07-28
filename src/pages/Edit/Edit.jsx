  import React, { useState, useRef } from "react";
  import "./Edit.css";

  const LAYOUTS = [
    { id: "strip-4", label: "Classic Strip", slots: 4 },
    { id: "grid-2x2", label: "2 x 2 Grid", slots: 4 },
    { id: "focus-1", label: "Hero Grid", slots: 4 },
    { id: "collage", label: "Mosaic Collage", slots: 5 },
    { id: "duo-split", label: "Mirror Split", slots: 2 },
    { id: "contact-sheet", label: "Contact Sheet", slots: 6 },
    { id: "film-strip", label: "Retro Film", slots: 4 },
    { id: "grid-3x3", label: "3 x 3 Grid", slots: 9 },
  ];

  const FRAME_COLORS = [
    { id: "frame-white", bg: "#FFFFFF", text: "#18181B", name: "Classic White" },
    { id: "frame-dark", bg: "#18181B", text: "#FAFAFA", name: "Noir Black" },
    { id: "frame-amber", bg: "#FFF3DC", text: "#78350F", name: "Warm Amber" },
    { id: "frame-flame", bg: "#FDE3DC", text: "#991B1B", name: "Flame Rose" },
    { id: "frame-sage", bg: "#DCFCE7", text: "#14532D", name: "Sage Green" },
    { id: "frame-blush", bg: "#FCE7F3", text: "#831843", name: "Blush Pink" },
    { id: "frame-sky", bg: "#DBEAFE", text: "#1E40AF", name: "Sky Blue" },
    { id: "frame-kraft", bg: "#EFE0C8", text: "#451A03", name: "Kraft Paper" },
  ];

  const FRAME_PATTERNS = [
    { id: "none", label: "Solid" },
    { id: "dots", label: "Polka Dots" },
    { id: "stripes", label: "Stripes" },
    { id: "checker", label: "Checker" },
  ];

  const FILTERS = [
    { id: "none", label: "Original" },
    { id: "bw", label: "B & W Mono" },
    { id: "vintage", label: "Sepia Vintage" },
    { id: "cool", label: "Cool Ice" },
    { id: "warm", label: "Golden Warm" },
    { id: "cyber", label: "Cyber Neon" },
  ];

  const loadHtml2Canvas = () => {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => resolve(window.html2canvas);
      script.onerror = () => reject(new Error("Failed to load html2canvas library"));
      document.body.appendChild(script);
    });
  };

  function LayoutIcon({ id }) {
    switch (id) {
      case "strip-4":
        return (
          <div className="icon-preview icon-strip-4">
            <div /><div /><div /><div />
          </div>
        );
      case "grid-2x2":
        return (
          <div className="icon-preview icon-grid-2x2">
            <div /><div /><div /><div />
          </div>
        );
      case "focus-1":
        return (
          <div className="icon-preview icon-focus-1">
            <div className="big" />
            <div className="small-group">
              <div /><div /><div />
            </div>
          </div>
        );
      case "collage":
        return (
          <div className="icon-preview icon-collage">
            <div className="big-block" />
            <div /><div /><div /><div />
          </div>
        );
      case "duo-split":
        return (
          <div className="icon-preview icon-duo-split">
            <div /><div />
          </div>
        );
      case "contact-sheet":
        return (
          <div className="icon-preview icon-contact-sheet">
            <div /><div /><div /><div /><div /><div />
          </div>
        );
      case "film-strip":
        return (
          <div className="icon-preview icon-film-strip">
            <div /><div /><div /><div />
          </div>
        );
      case "grid-3x3":
        return (
          <div className="icon-preview icon-grid-3x3">
            <div /><div /><div /><div /><div /><div /><div /><div /><div />
          </div>
        );
      default:
        return null;
    }
  }

  export default function Edit({ photo, back, next }) {
    const initialPhotos = Array.isArray(photo) ? photo : photo ? [photo] : [];
    const [photosList, setPhotosList] = useState(initialPhotos);

    // Filter & Adjustments State
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturate, setSaturate] = useState(100);
    const [filter, setFilter] = useState("none");

    // Grid, Spacing & Frame Customization State
    const [layoutMode, setLayoutMode] = useState("strip-4");
    const [frameColorId, setFrameColorId] = useState("frame-white");
    const [patternId, setPatternId] = useState("none");
    const [gridGap, setGridGap] = useState(10);
    const [borderRadius, setBorderRadius] = useState(8);

    // Watermark Custom Text
    const [customTitle, setCustomTitle] = useState("PHOTO BOOTH");
    const [customSubtitle, setCustomSubtitle] = useState("• 2026 MEMORIES •");

    // Interactive Photo Swap State
    const [swapSourceIndex, setSwapSourceIndex] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const previewRef = useRef(null);
    const activeFrameColor = FRAME_COLORS.find((c) => c.id === frameColorId) || FRAME_COLORS[0];

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
        case "cyber":
          filterString += " hue-rotate(290deg) contrast(130%) saturate(180%)";
          break;
        default:
          break;
      }

      return filterString;
    };

    const handlePhotoClick = (index) => {
      if (swapSourceIndex === null) {
        setSwapSourceIndex(index);
      } else if (swapSourceIndex === index) {
        setSwapSourceIndex(null);
      } else {
        const updated = [...photosList];
        const temp = updated[swapSourceIndex];
        updated[swapSourceIndex] = updated[index];
        updated[index] = temp;
        setPhotosList(updated);
        setSwapSourceIndex(null);
      }
    };

    const handleReset = () => {
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setFilter("none");
      setLayoutMode("strip-4");
      setFrameColorId("frame-white");
      setPatternId("none");
      setGridGap(10);
      setBorderRadius(8);
      setCustomTitle("PHOTO BOOTH");
      setCustomSubtitle("• 2026 MEMORIES •");
      setSwapSourceIndex(null);
    };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      setPhotosList((prev) => [...newImageUrls, ...prev]);
    };

    const handleFinishEdit = async () => {
      if (!previewRef.current) return;

      setIsExporting(true);

      try {
        const h2c = await loadHtml2Canvas();
        const canvas = await h2c(previewRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          windowWidth: 1480,
      });

        const finalImageDataUrl = canvas.toDataURL("image/png");

        if (typeof next === "function") {
          next({
            photo: finalImageDataUrl,
            photos: photosList,
            layoutMode,
            frameColor: activeFrameColor,
            filterSettings: { brightness, contrast, saturate, filter },
          });
        }
      } catch (err) {
        console.error("Gagal merender gambar:", err);
        if (typeof next === "function") next(photosList[0]);
      } finally {
        setIsExporting(false);
      }
    };

    const activeLayoutObj = LAYOUTS.find((l) => l.id === layoutMode) || LAYOUTS[0];
    const requiredSlots = activeLayoutObj.slots;

    const currentPhotos = [...photosList];
    while (currentPhotos.length < requiredSlots) {
      currentPhotos.push("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80");
    }

    if (photosList.length === 0) {
      return (
        <div className="edit-page">
          <div className="no-photo-card">
            <h2>📷 Tidak Ada Foto</h2>
            <p>Belum ada foto yang diambil dari kamera.</p>
            <button className="back-btn" onClick={back}>
              ← Kembali ke Kamera
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="edit-page">
        {/* Decorative film elements */}
        <div className="edit-grain" />
        <div className="edit-corner edit-corner-tl" />
        <div className="edit-corner edit-corner-tr" />
        <div className="edit-corner edit-corner-bl" />
        <div className="edit-corner edit-corner-br" />

        {/* Header Navigation */}
        <header className="edit-header">
          <button className="back-btn" onClick={back} disabled={isExporting}>
            ← Kembali
          </button>
          <h2>
            🎞️ <span>PHOTO BOOTH EDITOR</span>
          </h2>
          <button
            className="confirm-btn"
            onClick={handleFinishEdit}
            disabled={isExporting}
          >
            {isExporting ? "Memproses..." : "Selesai & Lanjut →"}
          </button>
        </header>

        {/* Main Studio Container */}
        <div className="edit-container">
          {/* LEFT: LIVE CANVAS PREVIEW */}
          <div className="preview-card">
            <div className="preview-hud">
              <span className="dot" /> LIVE PREVIEW
            </div>

            {swapSourceIndex !== null && (
              <div className="swap-notice-banner">
                Klik foto tujuan untuk menukar posisi
              </div>
            )}

            {/* DYNAMIC FRAME WRAPPER */}
            <div
              ref={previewRef}
              className={`photo-strip-frame pattern-${patternId}`}
              style={{
                backgroundColor: activeFrameColor.bg,
                color: activeFrameColor.text,
              }}
            >
              {/* GRID LAYOUT CONTAINING PHOTOS */}
              <div
                className={`grid-layout ${layoutMode}`}
                style={{ gap: `${gridGap}px` }}
              >
                {currentPhotos.slice(0, requiredSlots).map((item, idx) => {
                  const isSwapSource = swapSourceIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`grid-item item-${idx + 1} ${
                        isSwapSource ? "source-swap" : ""
                      }`}
                      style={{ borderRadius: `${borderRadius}px` }}
                      onClick={() => handlePhotoClick(idx)}
                    >
                      <img
                        src={item}
                        alt={`Photo ${idx + 1}`}
                        style={{ filter: getFilterStyle() }}
                      />
                      
                    </div>
                  );
                })}
              </div>

              {/* WATERMARK BRANDING FOOTER */}
              <div className="strip-footer">
                <div className="footer-title">{customTitle || "PHOTO BOOTH"}</div>
                <div className="footer-sub">{customSubtitle || "• 2026 •"}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION CONTROL PANEL */}
          <div className="editor-panel">
            <div className="panel-header">
              <h3>Customization Studio</h3>
              <button className="reset-btn" onClick={handleReset}>
                🔄 Reset
              </button>
            </div>

            {/* 1. LAYOUT SELECTION */}
            <div className="control-section">
              <label className="section-label">Pilih Layout Grid</label>
              <div className="layout-picker-grid">
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

            {/* 2. FRAME COLOR & PATTERN */}
            <div className="control-section">
              <label className="section-label">Warna & Pattern Frame</label>
              <div className="color-picker-row">
                {FRAME_COLORS.map((c) => (
                  <button
                    key={c.id}
                    className={`color-dot ${
                      frameColorId === c.id ? "active" : ""
                    }`}
                    style={{ backgroundColor: c.bg }}
                    title={c.name}
                    onClick={() => setFrameColorId(c.id)}
                  />
                ))}
              </div>

              <div className="pattern-row">
                {FRAME_PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    className={`chip-btn ${patternId === p.id ? "active" : ""}`}
                    onClick={() => setPatternId(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SPACING & RADIUS SLIDERS */}
            <div className="control-section">
              <label className="section-label">Jarak Grid & Sudut Frame</label>
              <div className="slider-group">
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
                  <span>Lengkungan Sudut (Radius)</span>
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

            {/* 4. PRESET FILTERS */}
            <div className="control-section">
              <label className="section-label">Filter Warna</label>
              <div className="filter-grid">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    className={`chip-btn ${filter === f.id ? "active" : ""}`}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. IMAGE ADJUSTMENT SLIDERS */}
            <div className="control-section">
              <label className="section-label">Pengaturan Manual Foto</label>

              <div className="slider-group">
                <div className="slider-header">
                  <span>Brightness (Kecerahan)</span>
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
                  <span>Contrast (Kontras)</span>
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
                  <span>Saturation (Saturasi Warna)</span>
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

            {/* 6. WATERMARK TEXT OVERLAYS */}
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

            {/* 7. UPLOAD LOCAL PHOTOS */}
            <div className="control-section">
              <label className="section-label">Tambah Foto dari Galeri</label>
              <div className="file-upload-box">
                <button className="upload-btn">📁 Unggah Foto Lokal</button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }