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

const slotCountByLayout = {
  "layout-strip-2": 2,
  "layout-strip-3": 3,
  "layout-strip-4": 4,
  "layout-grid-2x2": 4,
  "layout-grid-3x3": 9,
  "layout-polaroid": 1,
  "layout-hero-2": 3,
  "layout-3x2": 6,
  "layout-2x3": 6,
  "layout-stack": 4,
};

function Camera({ onCaptureComplete, setPhotos: setPhotosParent, setPhoto, next, back, selectedTemplate }) {
  const webcamRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const lastVideoTime = useRef(-1);
  const animationFrameRef = useRef(null);
  const isCapturing = useRef(false);

  const selectedLayout = selectedTemplate?.layout || "layout-grid-2x2";
  const maxPhotos = slotCountByLayout[selectedLayout] || 4;

  const [isBlurring, setIsBlurring] = useState(false);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isCooldown, setIsCooldown] = useState(false);

  useEffect(() => {
    setPhotos((prev) => prev.slice(0, maxPhotos));
  }, [maxPhotos]);

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

    isCapturing.current = true;

    setIsBlurring(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

    setIsCooldown(true);
    setTimeout(() => {
      isCapturing.current = false;
      setIsCooldown(false);
    }, 1000);
  };

  const handleRetakeLast = () => {
    setPhotos((prev) => prev.slice(0, -1));
  };

  // FIX: Mengirimkan array foto ke semua kemungkinan prop handler
  const handleConfirm = () => {
    if (typeof setPhotosParent === "function") {
      setPhotosParent(photos);
    }
    if (typeof setPhoto === "function") {
      setPhoto(photos);
    }
    if (typeof onCaptureComplete === "function") {
      onCaptureComplete(photos);
    }
    if (typeof next === "function") {
      next();
    }
  };

  return (
    <div className="camera-page">
      <div className="cam-glow cam-glow1"></div>
      <div className="cam-glow cam-glow2"></div>
      <div className="cam-grain" aria-hidden="true"></div>

      <span className="cam-corner cam-corner-tl" aria-hidden="true"></span>
      <span className="cam-corner cam-corner-tr" aria-hidden="true"></span>
      <span className="cam-corner cam-corner-bl" aria-hidden="true"></span>
      <span className="cam-corner cam-corner-br" aria-hidden="true"></span>

      <SprocketStrip />

      <div className="camera-content">
        <header className="camera-header">
          <button className="back-btn" onClick={back}>
            ← KEMBALI
          </button>
          <h2>
            PHOTO <span>BOOTH</span>
          </h2>
          
          <div className="take-selector-container">
            <label htmlFor="take-select">TAKE:</label>
            <select
              id="take-select"
              className="take-select"
              value={maxPhotos}
              disabled={photos.length > 0 || isCapturing.current}
            >
              <option value={maxPhotos}>{maxPhotos} Foto</option>
            </select>
          </div>
        </header>

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