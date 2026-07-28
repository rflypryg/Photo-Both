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

  const [isBlurring, setIsBlurring] = useState(false);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState([]);

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
      photos.length >= 4
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
    if (isBlurring || isCapturing.current || photos.length >= 4) return;

    isCapturing.current = true;

    // Countdown Blur 3 Detik
    setIsBlurring(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Flash & Ambil Gambar
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

    isCapturing.current = false;
  };

  const handleRetakeLast = () => {
    setPhotos((prev) => prev.slice(0, -1));
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
          <div style={{ width: "95px" }}></div>
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
              {photos.length < 4
                ? `TAKE ${photos.length + 1} / 4`
                : "SELESAI (4/4)"}
            </div>
            <div className="camera-status-inline">
              <span
                className={`status-dot ${
                  photos.length >= 4 ? "done" : "online"
                }`}
              ></span>
              {photos.length >= 4
                ? "SELESAI! KLIK LANJUT"
                : isBlurring
                ? "SENYUM! 📸"
                : "POSE PEACE ✌️"}
            </div>
          </div>
        </div>

        {/* Slot Grid Preview Foto (Tampilan ala Polaroid Tape) */}
        <div className="camera-preview-slots">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`photo-slot-tile ${photos[index] ? "has-photo" : ""}`}
            >
              <span className="photo-slot-tape" aria-hidden="true"></span>
              {photos[index] ? (
                <img src={photos[index]} alt={`Take ${index + 1}`} />
              ) : (
                <span className="slot-number">0{index + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Panel Kontrol Shutter & Retake */}
        <div className="camera-controls">
          {photos.length > 0 && photos.length < 4 && (
            <button
              className="retake-btn-icon"
              onClick={handleRetakeLast}
              disabled={isBlurring}
              title={`Hapus Foto Ke-${photos.length}`}
            >
              ↩
            </button>
          )}

          <button
            className={`capture-btn ${isCapturing.current ? "loading" : ""}`}
            onClick={captureSingle}
            disabled={isCapturing.current || photos.length >= 4}
          >
            <div className="capture-btn-inner"></div>
          </button>

          {photos.length === 4 && (
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