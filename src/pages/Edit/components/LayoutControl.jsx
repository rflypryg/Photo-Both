import React from "react";

// Helper Icon Visual yang presisi sesuai bentuk layout
const DynamicLayoutIcon = ({ id }) => {
  const iconBoxStyle = {
    width: "22px",
    height: "22px",
    display: "grid",
    gap: "2px",
    padding: "2px",
    border: "1.5px solid currentColor",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  const itemStyle = {
    backgroundColor: "currentColor",
    borderRadius: "1px",
  };

  switch (id) {
    case "layout-strip-2":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateRows: "repeat(2, 1fr)", gridTemplateColumns: "1fr" }}>
          {[...Array(2)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-strip-3":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateRows: "repeat(3, 1fr)", gridTemplateColumns: "1fr" }}>
          {[...Array(3)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-strip-4":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateRows: "repeat(4, 1fr)", gridTemplateColumns: "1fr" }}>
          {[...Array(4)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-grid-2x2":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
          {[...Array(4)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-grid-3x3":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)" }}>
          {[...Array(9)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-polaroid":
      return (
        <div style={{ ...iconBoxStyle, display: "flex", flexDirection: "column", padding: "2px 2px 5px 2px" }}>
          <div style={{ ...itemStyle, flex: 1 }} />
        </div>
      );
    case "layout-hero-2":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateRows: "2fr 1fr", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ ...itemStyle, gridColumn: "span 2" }} />
          <div style={itemStyle} />
          <div style={itemStyle} />
        </div>
      );
    case "layout-stack":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateColumns: "1fr", gridTemplateRows: "1fr 1fr" }}>
          {[...Array(2)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-3x2":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)" }}>
          {[...Array(6)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    case "layout-2x3":
      return (
        <div style={{ ...iconBoxStyle, gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(3, 1fr)" }}>
          {[...Array(6)].map((_, i) => <div key={i} style={itemStyle} />)}
        </div>
      );
    default:
      return <div style={iconBoxStyle} />;
  }
};

export default function LayoutControl({ layouts, layoutMode, setLayoutMode }) {
  return (
    <div className="control-section">
      <label className="section-label">Pilih Layout Grid</label>
      <div className="layout-picker-grid">
        {layouts.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`layout-btn ${layoutMode === l.id ? "active" : ""}`}
            onClick={() => setLayoutMode(l.id)}
          >
            <DynamicLayoutIcon id={l.id} />
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}