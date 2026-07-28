import React, { useEffect, useState } from 'react';
// Ubah baris ke-2 di Welcome.jsx
import logoCamera from "../../assets/camera.png";
import './Welcome.css';

function Welcome({ onStart }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pbw-root">
      {/* Background & Frame Elements */}
      <div className="pbw-glow pbw-glow1" />
      <div className="pbw-glow pbw-glow2" />
      <div className="pbw-grain" />

      <div className="pbw-corner pbw-corner-tl" />
      <div className="pbw-corner pbw-corner-tr" />
      <div className="pbw-corner pbw-corner-bl" />
      <div className="pbw-corner pbw-corner-br" />

      {/* Top Film Sprocket Strip */}
      <div className="pbw-strip">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`top-${i}`} className="pbw-hole" />
        ))}
      </div>

      {/* --- HEADER DI PALING ATAS (POJOK KIRI & KANAN) --- */}
      <header className="pbw-header-row">
        {/* Logo Kamera di Pojok Kiri */}
        <div className="pbw-logo">
          <img
            src={logoCamera}
            alt="Logo Kamera Photobooth"
            className="pbw-logo-img"
          />
        </div>

        {/* Badge di Pojok Kanan */}
        <span className="pbw-badge">Photobooth Experience</span>
      </header>
      
      {/* Main Content Area */}
      <div className={`pbw-content ${armed ? 'pbw-armed' : ''}`}>
        <div className="pbw-hud">
          <span className="pbw-hud-rec">
            <i /> REC
          </span>
          <span>ISO 400</span>
          <span>35MM</span>
          <span>f/2.8</span>
        </div>

        <h1 className="pbw-title">
          CAPTURE THE <span>MOMENT</span>
        </h1>

        <p className="pbw-desc">
          Abadikan senyuman dan kenangan manismu. Pilih frame favorit, bergaya di depan kamera, dan cetak hasilnya secara instan.
        </p>

        <button className="pbw-start" onClick={onStart}>
          <span className="pbw-shutter" />
          Mulai Sesi Photo
        </button>

        {/* Feature Cards Grid */}
        <div className="pbw-features">
          <div className="pbw-feature">
            <div className="pbw-feature-tape" />
            <div className="pbw-feature-icon">01</div>
            <h4>Multi-Frame</h4>
            <p>Pilihan tata letak strip film klasik hingga layout modern.</p>
          </div>

          <div className="pbw-feature">
            <div className="pbw-feature-tape" />
            <div className="pbw-feature-icon">02</div>
            <h4>Live Filter</h4>
            <p>Efek warna vintage, b&w, hingga warna hangat retro.</p>
          </div>

          <div className="pbw-feature">
            <div className="pbw-feature-tape" />
            <div className="pbw-feature-icon">03</div>
            <h4>Cetak & Digital</h4>
            <p>Dapatkan hasil cetak fisik dan unduh file via QR Code.</p>
          </div>
        </div>
      </div>

      {/* Bottom Film Sprocket Strip */}
      <div className="pbw-strip">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`bottom-${i}`} className="pbw-hole" />
        ))}
      </div>
    </section>
  );
}

export default Welcome;