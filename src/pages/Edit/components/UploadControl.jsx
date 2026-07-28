import React from "react";

export default function UploadControl({ handleImageUpload }) {
  return (
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
  );
}