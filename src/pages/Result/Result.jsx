import React, { useState } from "react";
import "./Result.css";

function Result({ photo, back, home }) {
  const [copied, setCopied] = useState(false);

  // Download Foto
  const downloadPhoto = () => {
    if (!photo) return;
    const link = document.createElement("a");
    link.href = photo;
    link.download = `PhotoBooth-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bagikan Foto
  const sharePhoto = async () => {
    if (!photo) return;

    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(photo);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Gagal menyalin foto:", err);
      }
      return;
    }

    try {
      const response = await fetch(photo);
      const blob = await response.blob();
      const file = new File([blob], `PhotoBooth-${Date.now()}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Foto Saya dari PhotoBooth",
          text: "Lihat hasil fotoku dari PhotoBooth!",
        });
      } else {
        await navigator.share({
          title: "PhotoBooth",
          url: window.location.href,
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  if (!photo) {
    return (
      <main className="result-page">
        <div className="result-grain" />
        <div className="result-corner result-corner-tl" />
        <div className="result-corner result-corner-tr" />
        <div className="result-corner result-corner-bl" />
        <div className="result-corner result-corner-br" />

        <div className="empty-card">
          <div className="empty-icon">📷</div>
          <h2>Foto Tidak Ditemukan</h2>
          <p>Sepertinya tidak ada foto yang tersimpan dari sesi ini.</p>
          <div className="button-group single">
            <button className="primary-btn" onClick={back}>
              ⬅ Kembali ke Editor
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="result-page">
      {/* Decorative film layer, consistent with Welcome & Edit */}
      <div className="result-grain" />
      <div className="result-corner result-corner-tl" />
      <div className="result-corner result-corner-tr" />
      <div className="result-corner result-corner-bl" />
      <div className="result-corner result-corner-br" />

      <div className="result-sprocket">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`s-${i}`} className="hole" />
        ))}
      </div>

      <div className="result-card">
        <div className="result-header">
          <span className="badge">🎉 Foto Berhasil Disimpan</span>
          <h1>Hasil Foto Siap!</h1>
          <p>
            Terima kasih telah menggunakan PhotoBooth. Kamu bisa mengunduh,
            membagikan, atau memulai sesi foto baru.
          </p>
        </div>

        {/* Tampilan gambar hasil ekspor dari Edit — ukuran & rasio
            mengikuti persis .photo-strip-frame di halaman Edit,
            karena gambar ini memang screenshot dari frame tersebut */}
        <div className="photo-frame-shell">
          <div className="preview-hud">
            <span className="dot" /> DEVELOPED
          </div>

          <div className="photo-container">
            <img
              src={photo}
              alt="Hasil Photo Booth"
              className="photo-preview"
            />
          </div>
        </div>

        <div className="action-label">Pilih Aksi</div>

        <div className="button-group">
          <button className="download-btn" onClick={downloadPhoto}>
            <span className="btn-icon">⬇</span> Unduh Foto
          </button>

          <div className="button-row">
            <button className="share-btn" onClick={sharePhoto}>
              <span className="btn-icon">📲</span>{" "}
              {copied ? "Link Disalin!" : "Bagikan"}
            </button>

            <button className="retake-btn" onClick={back}>
              <span className="btn-icon">📸</span> Edit Ulang
            </button>
          </div>

          <button className="home-btn" onClick={home}>
            🏠 Kembali ke Beranda
          </button>
        </div>
      </div>
    </main>
  );
}

export default Result;