import React, { useState } from "react";
// Import komponen Welcome dan halaman lainnya
import Welcome from "./pages/Welcome/Welcome"; // Sesuaikan jika filenya Welcome.jsx / Welcome.js
import Camera from "./pages/Camera/Camera";
import Edit from "./pages/Edit/Edit";
import Result from "./pages/Result/Result";

function App() {
  // 1. Ubah default state awal ke "welcome"
  const [currentPage, setCurrentPage] = useState("welcome"); 
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [finalPhoto, setFinalPhoto] = useState(null);

  // Navigasi dari Welcome -> Camera
  const handleStartPhoto = () => {
    setCurrentPage("camera");
  };

  // Navigasi dari Camera -> Edit
  const handleCameraCapture = (photos) => {
    setCapturedPhotos(photos);
    setCurrentPage("edit");
  };

  // Navigasi dari Edit -> Result
  const handleEditComplete = (editResult) => {
    const photoToSave =
      typeof editResult === "string" ? editResult : editResult?.photo;

    setFinalPhoto(photoToSave);
    setCurrentPage("result");
  };

  // Navigasi Kembali / Reset
  const handleBackToWelcome = () => {
    setCurrentPage("welcome");
  };

  const handleBackToCamera = () => {
    setCurrentPage("camera");
  };

  const handleBackToEdit = () => {
    setCurrentPage("edit");
  };

  return (
    <div className="app-container">
      {/* 2. Halaman Pertama: Welcome */}
      {currentPage === "welcome" && (
        <Welcome onStart={handleStartPhoto} start={handleStartPhoto} />
      )}

      {/* Halaman Kedua: Camera */}
      {currentPage === "camera" && (
        <Camera
          onCaptureComplete={handleCameraCapture}
          back={handleBackToWelcome}
        />
      )}

      {/* Halaman Ketiga: Edit */}
      {currentPage === "edit" && (
        <Edit
          photo={capturedPhotos}
          back={handleBackToCamera}
          next={handleEditComplete}
        />
      )}

      {/* Halaman Keempat: Result */}
      {currentPage === "result" && (
        <Result
          photo={finalPhoto}
          back={handleBackToEdit}
          home={handleBackToWelcome} // Tombol beranda langsung balik ke Welcome
        />
      )}
    </div>
  );
}

export default App;