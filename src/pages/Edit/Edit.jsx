import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./Edit.css";

import FilterControl from "./components/FilterControl";
import FrameStyleControl from "./components/FrameStyleControl";
import LayoutControl from "./components/LayoutControl";
import TextControl from "./components/TextControl";
import UploadControl from "./components/UploadControl";
import TemplateControl from "./components/TemplateControl";

const frameColors = [
  { id: "cream", name: "Cream", bg: "#F7E7B0" },
  { id: "rose", name: "Rose", bg: "#F6C2D1" },
  { id: "mint", name: "Mint", bg: "#D6F3E5" },
  { id: "sky", name: "Sky", bg: "#CFE8FF" },
  { id: "choco", name: "Choco", bg: "#4B2E2B" },
  { id: "charcoal", name: "Charcoal", bg: "#2F2A2A" },
];

const framePatterns = [
  { id: "pattern-dots", label: "Dots" },
  { id: "pattern-stripes", label: "Stripes" },
  { id: "pattern-grid", label: "Grid" },
  { id: "pattern-gingham", label: "Gingham" },
  { id: "pattern-stars", label: "Stars" },
  { id: "pattern-checkers", label: "Checkers" },
];

const filters = [
  { id: "none", label: "Normal" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "mono", label: "Mono" },
  { id: "sepia", label: "Sepia" },
  { id: "vintage", label: "Vintage" },
];

const layouts = [
  { id: "layout-grid-2x2", label: "2x2 Classic", count: 4 },
  { id: "layout-strip-3", label: "Strip 3", count: 3 },
  { id: "layout-strip-4", label: "Strip 4", count: 4 },
  { id: "layout-2x3", label: "Recap 2x3", count: 6 },
  { id: "layout-3x2", label: "3x2", count: 6 },
  { id: "layout-stack", label: "Stack", count: 4 },
];

// Daftar Template Overlay (PNG transparan disimpan di public/templates/)
const templates = [
  {
    id: "retro-gold",
    name: "Retro Gold",
    description: "Template klasik dengan nuansa elegan",
    overlay: "/templates/retro-gold.png",
    layout: "layout-2x3",
    frameColor: "cream",
    pattern: "pattern-dots",
  },
  {
    id: "soft-pink",
    name: "Soft Pink",
    description: "Template lembut dan hangat",
    overlay: "/templates/soft-pink.png",
    layout: "layout-grid-2x2",
    frameColor: "rose",
    pattern: "pattern-checkers",
  },
];

function getFilterValue(filterId) {
  switch (filterId) {
    case "warm":
      return "brightness(1.05) saturate(1.15) sepia(0.1)";
    case "cool":
      return "brightness(1.02) saturate(0.95) hue-rotate(-10deg)";
    case "mono":
      return "grayscale(1) contrast(1.05)";
    case "sepia":
      return "sepia(0.8) saturate(0.85) contrast(1.05)";
    case "vintage":
      return "sepia(0.65) saturate(0.8) brightness(1.02) contrast(1.08)";
    default:
      return "none";
  }
}

export default function Edit({ photos = [], back, onRestart, initialTemplate }) {
  const frameRef = useRef(null);
  const [photoItems, setPhotoItems] = useState([]);
  const [layoutMode, setLayoutMode] = useState("layout-grid-2x2");
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate || null);
  const [frameColorId, setFrameColorId] = useState("cream");
  const [patternId, setPatternId] = useState("pattern-dots");
  const [gridGap, setGridGap] = useState(10);
  const [borderRadius, setBorderRadius] = useState(8);
  const [filter, setFilter] = useState("none");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [customTitle, setCustomTitle] = useState("PHOTO BOOTH");
  const [customSubtitle, setCustomSubtitle] = useState("MEMORI KITA");
  const [photoAspectRatios, setPhotoAspectRatios] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setPhotoItems(Array.isArray(photos) ? photos : []);
  }, [photos]);

  useEffect(() => {
    if (initialTemplate) {
      applyTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const activeFrameColor = useMemo(
    () => frameColors.find((color) => color.id === frameColorId) || frameColors[0],
    [frameColorId]
  );

  function applyTemplate(template) {
    if (!template) {
      setSelectedTemplate(null);
      return;
    }
    setSelectedTemplate(template);
    if (template.frameColor) setFrameColorId(template.frameColor);
    if (template.pattern) setPatternId(template.pattern);
    if (template.filter) setFilter(template.filter);
    if (template.brightness) setBrightness(template.brightness);
    if (template.contrast) setContrast(template.contrast);
    if (template.saturate) setSaturate(template.saturate);
    if (template.title) setCustomTitle(template.title);
    if (template.subtitle) setCustomSubtitle(template.subtitle);
  }

  // Deteksi rasio asli gambar secara otomatis
  const handlePhotoLoad = (event, src) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const ratio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 4 / 3;

    setPhotoAspectRatios((prev) => {
      if (prev[src] === ratio) return prev;
      return { ...prev, [src]: ratio };
    });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((results) => {
      setPhotoItems((prev) => [...prev, ...results]);
      event.target.value = "";
    });
  };

  const handleDownload = async () => {
    if (!frameRef.current) return;
    setIsDownloading(true);

    try {
      const frame = frameRef.current;
      const templateOverlay = frame.querySelector('img[alt="Template Overlay"]');
      if (templateOverlay) {
        templateOverlay.remove();
      }

      const images = Array.from(frame.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      await new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 120));
      });

      const canvas = await html2canvas(frame, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: frame.scrollWidth,
        height: frame.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `photo-booth-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Gagal mengunduh hasil edit:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const currentLayoutObj = layouts.find((item) => item.id === layoutMode);
  const maxPhotos = currentLayoutObj ? currentLayoutObj.count : 4;
  const visiblePhotos = photoItems.slice(0, maxPhotos);

  // Aturan Grid & Padding
  const { gridStyle, canvasPadding } = useMemo(() => {
    let style = {};
    const padding = "24px";

    switch (layoutMode) {
      case "layout-grid-2x2":
        style = {
          gridTemplateColumns: "repeat(2, 1fr)",
        };
        break;
      case "layout-strip-3":
        style = {
          gridTemplateColumns: "1fr",
        };
        break;
      case "layout-strip-4":
        style = {
          gridTemplateColumns: "1fr",
        };
        break;
      case "layout-2x3":
        style = {
          gridTemplateColumns: "repeat(2, 1fr)",
        };
        break;
      case "layout-3x2":
        style = {
          gridTemplateColumns: "repeat(3, 1fr)",
        };
        break;
      default:
        style = {
          gridTemplateColumns: "repeat(2, 1fr)",
        };
    }

    return { gridStyle: style, canvasPadding: padding };
  }, [layoutMode, selectedTemplate]);

  return (
    <div className="edit-container">
      <header className="edit-header">
        <button className="back-btn" onClick={back}>
          ← KEMBALI
        </button>
        <h2>PHOTO BOOTH EDIT</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="upload-btn" onClick={onRestart}>
            FOTO ULANG
          </button>
          <button className="next-btn" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? "MENGUNDUH..." : "DOWNLOAD PNG"}
          </button>
        </div>
      </header>

      <main className="edit-workspace">
        {/* PREVIEW CANVAS */}
        <section className="preview-area">
          <div
            ref={frameRef}
            className={`photo-frame-canvas ${patternId}`}
            style={{
              position: "relative",
              backgroundColor: activeFrameColor.bg,
              color: activeFrameColor.id === "charcoal" || activeFrameColor.id === "choco" ? "#F7F1E3" : "#1C1917",
              padding: canvasPadding,
              width: "100%",
              maxWidth: "440px",
              height: "auto",
              borderRadius: "24px",
              boxSizing: "border-box",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {/* LAYER 1: GRID FOTO */}
            <div
              className={`grid-layout ${layoutMode}`}
              style={{
                display: "grid",
                gap: `${gridGap}px`,
                width: "100%",
                boxSizing: "border-box",
                zIndex: 1,
                ...gridStyle,
              }}
            >
              {visiblePhotos.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="photo-item"
                  style={{
                    borderRadius: `${borderRadius}px`,
                    aspectRatio: photoAspectRatios[src] || "4 / 3",
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    onLoad={(event) => handlePhotoLoad(event, src)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) ${getFilterValue(filter)}`,
                    }}
                  />
                </div>
              ))}

              {/* Slot Kosong */}
              {Array.from({ length: Math.max(0, maxPhotos - visiblePhotos.length) }).map((_, idx) => (
                <div
                  key={`placeholder-${idx}`}
                  className="photo-item empty-slot"
                  style={{
                    borderRadius: `${borderRadius}px`,
                    aspectRatio: "4 / 3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.15)",
                    color: selectedTemplate ? "#fff" : "#888",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                >
                  Slot {visiblePhotos.length + idx + 1}
                </div>
              ))}
            </div>

            {/* WATERMARK TEKS */}
            <div
              className="frame-watermark"
              style={{
                position: "relative",
                zIndex: 3,
                marginTop: "16px",
                textAlign: "center",
                width: "100%",
                color: activeFrameColor.id === "charcoal" || activeFrameColor.id === "choco" ? "#F7F1E3" : "#1C1917",
              }}
            >
              <h3 className="wm-title" style={{ margin: 0, fontSize: "1.4rem", fontWeight: "bold" }}>
                {customTitle || "PHOTO BOOTH"}
              </h3>
              <p className="wm-subtitle" style={{ margin: "4px 0 0 0", fontSize: "0.85rem", letterSpacing: "2px" }}>
                {customSubtitle || "MEMORI KITA"}
              </p>
            </div>
          </div>
        </section>

        {/* SIDEBAR CONTROLS */}
        <aside className="controls-sidebar">
          <TemplateControl
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={applyTemplate}
          />
          <UploadControl handleImageUpload={handleImageUpload} />
          <LayoutControl layouts={layouts} layoutMode={layoutMode} setLayoutMode={setLayoutMode} />
          <FrameStyleControl
            frameColors={frameColors}
            frameColorId={frameColorId}
            setFrameColorId={setFrameColorId}
            framePatterns={framePatterns}
            patternId={patternId}
            setPatternId={setPatternId}
            gridGap={gridGap}
            setGridGap={setGridGap}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
          />
          <FilterControl
            filters={filters}
            filter={filter}
            setFilter={setFilter}
            brightness={brightness}
            setBrightness={setBrightness}
            contrast={contrast}
            setContrast={setContrast}
            saturate={saturate}
            setSaturate={setSaturate}
          />
          {!selectedTemplate && (
            <TextControl
              customTitle={customTitle}
              setCustomTitle={setCustomTitle}
              customSubtitle={customSubtitle}
              setCustomSubtitle={setCustomSubtitle}
            />
          )}
        </aside>
      </main>
    </div>
  );
}