import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

import { isPeaceGesture } from "../../utils/handGesture";
import "./Camera.css";

// Sprocket Film Strip yang selaras dengan Welcome Screen
function SprocketStrip() {
  const holes = Array.from({ length: 34 });
  return (
    <div className="cam-strip" aria-hidden="true">
      {holes.map((_, i) => (
        <span className="cam-hole" key={i} />
      ))}
    </div>
  );
}

function Camera({ onCaptureComplete, setPhoto, next, back }) {
  const webcamRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const lastVideoTime = useRef(-1);
  const animationFrameRef = useRef(null);
  const isCapturing = useRef(false);

  // Dynamic max photos state (Default 4, opsi: 4, 6, 8, 9)
  const [maxPhotos, setMaxPhotos] = useState(4);

  const [isBlurring, setIsBlurring] = useState(false);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isCooldown, setIsCooldown] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            },
            runningMode: "VIDEO",
            numHands: 1,
          }
        );

        if (mounted) {
          detectHands();
        }
      } catch (error) {
        console.error("Gagal memuat MediaPipe HandLandmarker:", error);
      }
    };

    init();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const detectHands = () => {
    // Mencegah deteksi berulang jika sedang mengambil foto, cooldown, atau foto sudah penuh
    if (
      !webcamRef.current ||
      !handLandmarkerRef.current ||
      isCapturing.current ||
      isCooldown ||
      photos.length >= maxPhotos
    ) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const video = webcamRef.current.video;

    if (!video || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    if (lastVideoTime.current !== video.currentTime) {
      lastVideoTime.current = video.currentTime;

      const result = handLandmarkerRef.current.detectForVideo(
        video,
        performance.now()
      );

      if (result.landmarks && result.landmarks.length > 0) {
        const hand = result.landmarks[0];

        if (isPeaceGesture(hand)) {
          captureSingle();
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  };

  const captureSingle = async () => {
    if (isBlurring || isCapturing.current || isCooldown || photos.length >= maxPhotos) return;

    // Kunci flag agar tidak kepicu berulang kali dari loop requestAnimationFrame
    isCapturing.current = true;

    // 1. Efek Blur berjalan selama 1 detik (1000ms)
    setIsBlurring(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Hilangkan blur lalu jalankan Flash & Ambil Gambar
    setIsBlurring(false);
    setFlash(true);

    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      if (image) {
        setPhotos((prev) => [...prev, image]);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    setFlash(false);

    // 3. Beri jeda cooldown (1 detik) sebelum gestur berikutnya bisa terdeteksi lagi
    setIsCooldown(true);
    setTimeout(() => {
      isCapturing.current = false;
      setIsCooldown(false);
    }, 1000);
  };

  const handleRetakeLast = () => {
    setPhotos((prev) => prev.slice(0, -1));
  };

  const handleMaxPhotosChange = (e) => {
    const newMax = parseInt(e.target.value, 10);
    setMaxPhotos(newMax);
    if (photos.length > newMax) {
      setPhotos((prev) => prev.slice(0, newMax));
    }
  };

  const handleConfirm = () => {
    if (typeof onCaptureComplete === "function") {
      onCaptureComplete(photos);
    } else {
      if (typeof setPhoto === "function") setPhoto(photos);
      if (typeof next === "function") next();
    }
  };

  return (
    <div className="camera-page">
      {/* Background Visual Effects */}
      <div className="cam-glow cam-glow1"></div>
      <div className="cam-glow cam-glow2"></div>
      <div className="cam-grain" aria-hidden="true"></div>

      {/* Frame Corners */}
      <span className="cam-corner cam-corner-tl" aria-hidden="true"></span>
      <span className="cam-corner cam-corner-tr" aria-hidden="true"></span>
      <span className="cam-corner cam-corner-bl" aria-hidden="true"></span>
      <span className="cam-corner cam-corner-br" aria-hidden="true"></span>

      <SprocketStrip />

      <div className="camera-content">
        {/* Header */}
        <header className="camera-header">
          <button className="back-btn" onClick={back}>
            ← KEMBALI
          </button>
          <h2>
            PHOTO <span>BOOTH</span>
          </h2>
          
          {/* Selector Pilihan Jumlah Take */}
          <div className="take-selector-container">
            <label htmlFor="take-select">TAKE:</label>
            <select
              id="take-select"
              className="take-select"
              value={maxPhotos}
              onChange={handleMaxPhotosChange}
              disabled={photos.length > 0 || isCapturing.current}
            >
              <option value={4}>4 Foto</option>
              <option value={6}>6 Foto</option>
              <option value={8}>8 Foto</option>
              <option value={9}>9 Foto</option>
            </select>
          </div>
        </header>

        {/* Display Webcam Viewfinder */}
        <div className="webcam-container">
          {flash && <div className="flash"></div>}

          <Webcam
            ref={webcamRef}
            mirrored
            audio={false}
            screenshotFormat="image/png"
            className={`webcam ${isBlurring ? "blur-effect" : ""}`}
            videoConstraints={{
              facingMode: "user",
            }}
          />

          {/* Viewfinder Overlays */}
          <div className="viewfinder-corners">
            <span className="corner top-left"></span>
            <span className="corner top-right"></span>
            <span className="corner bottom-left"></span>
            <span className="corner bottom-right"></span>
          </div>

          <div className="camera-grid">
            <div className="grid-line horizontal-1"></div>
            <div className="grid-line horizontal-2"></div>
            <div className="grid-line vertical-1"></div>
            <div className="grid-line vertical-2"></div>
          </div>

          {/* Status HUD Overlay */}
          <div className="camera-info-bar">
            <div className="take-badge-inline">
              {photos.length < maxPhotos
                ? `TAKE ${photos.length + 1} / ${maxPhotos}`
                : `SELESAI (${maxPhotos}/${maxPhotos})`}
            </div>
            <div className="camera-status-inline">
              <span
                className={`status-dot ${
                  photos.length >= maxPhotos ? "done" : "online"
                }`}
              ></span>
              {photos.length >= maxPhotos
                ? "SELESAI! KLIK LANJUT ATAU RETAKE"
                : isBlurring
                ? "SENYUM! 📸"
                : isCooldown
                ? "TUNGGU SEBENTAR... ⏳"
                : "POSE PEACE ✌️"}
            </div>
          </div>
        </div>

        {/* Slot Grid Preview Foto */}
        <div className="camera-preview-slots">
          {Array.from({ length: maxPhotos }).map((_, index) => (
            <div
              key={index}
              className={`photo-slot-tile ${photos[index] ? "has-photo" : ""}`}
            >
              <span className="photo-slot-tape" aria-hidden="true"></span>
              {photos[index] ? (
                <img src={photos[index]} alt={`Take ${index + 1}`} />
              ) : (
                <span className="slot-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Panel Kontrol Shutter & Retake */}
        <div className="camera-controls">
          {photos.length > 0 && (
            <button
              className="retake-btn-icon"
              onClick={handleRetakeLast}
              disabled={isBlurring || isCapturing.current}
              title={`Hapus Foto Ke-${photos.length}`}
            >
              ↩
            </button>
          )}

          <button
            className={`capture-btn ${
              isCapturing.current || isCooldown ? "loading" : ""
            }`}
            onClick={captureSingle}
            disabled={
              isCapturing.current || isCooldown || photos.length >= maxPhotos
            }
          >
            <div className="capture-btn-inner"></div>
          </button>

          {photos.length === maxPhotos && (
            <button className="confirm-btn-compact" onClick={handleConfirm}>
              LANJUT ➔
            </button>
          )}
        </div>
      </div>

      <SprocketStrip />
    </div>
  );
}

export default Camera;