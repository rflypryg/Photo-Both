import React, { useState } from "react";
import Welcome from "./pages/Welcome/Welcome";
import Camera from "./pages/Camera/Camera";
import Edit from "./pages/Edit/Edit";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome"); 
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: "classic",
    label: "Classic",
    description: "Grid 2x2 simpel",
    layout: "layout-grid-2x2",
    frameColor: "cream",
    pattern: "pattern-dots",
    filter: "none",
    brightness: 100,
    contrast: 100,
    saturate: 100,
    title: "PHOTO BOOTH",
    subtitle: "MEMORI KITA",
  });

  // Navigasi Welcome -> Camera
  const handleStartPhoto = (template = selectedTemplate) => {
    setSelectedTemplate(template);
    setCurrentPage("camera");
  };

  // Navigasi Camera -> Edit
  const handleCameraCapture = (photos) => {
    if (photos && photos.length > 0) {
      setCapturedPhotos(photos);
      setCurrentPage("edit");
    }
  };

  // Navigasi Kembali
  const handleBackToWelcome = () => {
    setCurrentPage("welcome");
  };

  const handleBackToCamera = () => {
    setCurrentPage("camera");
  };

  return (
    <div className="app-container">
      {/* 1. Welcome */}
      {currentPage === "welcome" && (
        <Welcome
          onStart={handleStartPhoto}
          start={handleStartPhoto}
        />
      )}

      {/* 2. Camera */}
      {currentPage === "camera" && (
        <Camera
          onCaptureComplete={handleCameraCapture}
          setPhotos={setCapturedPhotos}
          setPhoto={setCapturedPhotos}
          next={() => setCurrentPage("edit")}
          back={handleBackToWelcome}
          selectedTemplate={selectedTemplate}
        />
      )}

      {/* 3. Edit (Langsung include download & foto ulang) */}
      {currentPage === "edit" && (
        <Edit
          photos={capturedPhotos}
          photo={capturedPhotos}
          back={handleBackToCamera}
          onRestart={handleBackToWelcome}
          initialTemplate={selectedTemplate}
        />
      )}
    </div>
  );
}

export default App;