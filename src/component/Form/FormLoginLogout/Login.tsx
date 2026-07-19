import { useEffect, useRef, useState } from "react";
import carFront from '../../../assets/carfront.png';
import front_left from '../../../assets/front-left.png';
import front_right from '../../../assets/front-right.png';
import right from '../../../assets/right.png';
import left from '../../../assets/left.png';
import rear from '../../../assets/rear.png';
import rear_left from '../../../assets/rear-left.png';
import rear_right from '../../../assets/rear-right.png';
import seat_front from '../../../assets/seat-front.png';
import seat_rear from '../../../assets/seat-rear.png';
import dashboard from '../../../assets/dashboard.png';

type CameraStep = { key: string; label: string; instruction: string };
type CapturedPhoto = { key: string; dataUrl: string };

const cameraSteps: CameraStep[] = [
  { key: "front_view", label: "Front View", instruction: "Align the front of the vehicle centered in the frame." },
  { key: "front_left_3_4", label: "Front Left 3/4", instruction: "Position front-left corner of the vehicle." },
  { key: "front_right_3_4", label: "Front Right 3/4", instruction: "Position front-right corner of the vehicle." },
  { key: "right_side", label: "Right Side Profile", instruction: "Align the full right side of the vehicle." },
  { key: "rear_view", label: "Rear View", instruction: "Align the rear of the vehicle centered." },
  { key: "rear_left_3_4", label: "Rear Left 3/4", instruction: "Position rear-left corner of the vehicle." },
  { key: "rear_right_3_4", label: "Rear Right 3/4", instruction: "Position rear-right corner of the vehicle." },
  { key: "left_side", label: "Left Side Profile", instruction: "Align the full left side of the vehicle." },
  { key: "front_seat", label: "Front Seat", instruction: "Capture the front seat interior." },
  { key: "back_seat", label: "Back Seat", instruction: "Capture the back seat interior." },
  { key: "dashboard", label: "Dashboard", instruction: "Capture the complete dashboard and steering wheel." },
];

const carImageMap: Record<string, string> = {
  front_view: carFront,
  front_left_3_4: front_left,
  front_right_3_4: front_right,
  right_side: right,
  rear_view: rear,
  rear_left_3_4: rear_left,
  rear_right_3_4: rear_right,
  left_side: left,
  front_seat: seat_front,
  back_seat: seat_rear,
  dashboard: dashboard,
};

// ─── Car Ghost Overlay ────────────────────────────────────────
function CarOverlay({ stepKey, captured }: { stepKey: string; captured: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const src = carImageMap[stepKey];

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < 100 && g < 100 && b < 100) {
          data[i + 3] = 0;
        } else {
          data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
    img.src = src;
  }, [src]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%", height: "100%", objectFit: "contain",
          opacity: captured ? 0.75 : 0.55,
          filter: captured ? "drop-shadow(0 0 6px rgba(100,255,180,0.6))" : "none",
          transition: "opacity 0.3s ease, filter 0.3s ease",
          pointerEvents: "none", userSelect: "none",
        }}
      />
    </div>
  );
}

// ─── Step Dots ────────────────────────────────────────────────
function StepDots({
  total, current, photos, steps, onJump,
}: {
  total: number; current: number; photos: CapturedPhoto[]; steps: CameraStep[]; onJump: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
      {Array.from({ length: total }, (_, i) => {
        const captured = photos.some((p) => p.key === steps[i].key);
        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            style={{
              width: i === current ? 22 : 8, height: 8, borderRadius: 4,
              border: "none", cursor: "pointer", padding: 0,
              background: i === current ? "white" : captured ? "rgba(100,255,180,0.85)" : "rgba(255,255,255,0.28)",
              transition: "all 0.3s ease",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Thumbnail Strip ──────────────────────────────────────────
function ThumbnailStrip({
  photos, steps, currentStep, onSelect, onSelectCaptured,
}: {
  photos: CapturedPhoto[];
  steps: CameraStep[];
  currentStep: number;
  onSelect: (i: number) => void;
  onSelectCaptured: (i: number) => void; // ← NEW: jump to step AND enter preview
}) {
  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 10, pointerEvents: "auto" }}>
      {steps.map((step, i) => {
        const photo = photos.find((p) => p.key === step.key);
        const isActive = i === currentStep;
        return (
          <button
            key={step.key}
            onClick={() => {
              // If this thumbnail has a photo → show preview; otherwise just navigate
              if (photo) {
                onSelectCaptured(i);
              } else {
                onSelect(i);
              }
            }}
            style={{
              width: 34, height: 26, borderRadius: 5,
              border: isActive ? "2px solid white" : photo ? "2px solid rgba(100,255,180,0.85)" : "1.5px solid rgba(255,255,255,0.22)",
              overflow: "hidden", background: "rgba(0,0,0,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0, position: "relative",
              transform: isActive ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            {photo ? (
              <img src={photo.dataUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={step.label} />
            ) : (
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Arial, sans-serif" }}>{i + 1}</span>
            )}
            {photo && (
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 6, height: 6, borderRadius: "50%", background: "rgba(100,255,180,0.9)" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AutoClaimCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [flash, setFlash] = useState(false);
  const [done, setDone] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<CapturedPhoto | null>(null);
  const [previewMode, setPreviewMode] = useState(false); // ← NEW: show captured photo instead of camera

  const step = cameraSteps[currentStep];
  const currentPhoto = photos.find((p) => p.key === step.key);
  const alreadyCaptured = !!currentPhoto;
  const capturedCount = cameraSteps.filter((s) => photos.some((p) => p.key === s.key)).length;

  // When step changes via navigation (back/skip/dots), decide whether to preview or show camera.
  // We track the "reason" for the step change via a ref so capturePhoto can override this.
  const stepChangeReasonRef = useRef<"navigate" | "capture" | "retake">("navigate");

  useEffect(() => {
    const reason = stepChangeReasonRef.current;
    stepChangeReasonRef.current = "navigate"; // reset for next time

    if (reason === "retake") {
      // Always show camera after a retake
      setPreviewMode(false);
    } else {
      // navigate or capture: show preview if the new step already has a photo
      const nextStepKey = cameraSteps[currentStep]?.key;
      const hasPhoto = photos.some((p) => p.key === nextStepKey);
      setPreviewMode(hasPhoto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  async function startCamera() {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
      setCameraError(null);
    } catch {
      setCameraError("Camera access denied or not available.");
    }
  }

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!done) {
      const timer = setTimeout(() => { startCamera(); }, 100);
      return () => clearTimeout(timer);
    }
  }, [done]);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setFlash(true);
    setTimeout(() => setFlash(false), 280);

    setPhotos((prev) => [...prev.filter((p) => p.key !== step.key), { key: step.key, dataUrl }]);

    setTimeout(() => {
      if (currentStep < cameraSteps.length - 1) {
        stepChangeReasonRef.current = "capture"; // next step may already have a photo
        setCurrentStep((s) => s + 1);
      } else {
        setDone(true);
      }
    }, 380);
  }

  function goBack() { if (currentStep > 0) setCurrentStep((s) => s - 1); }
  function goNext() { if (currentStep < cameraSteps.length - 1) setCurrentStep((s) => s + 1); else if (photos.length > 0) setDone(true); }

  function retake() {
    stepChangeReasonRef.current = "retake";
    setPhotos((prev) => prev.filter((p) => p.key !== step.key));
    setPreviewMode(false); // exit preview, show camera
  }

  function restart() { setPhotos([]); setCurrentStep(0); setDone(false); setPreviewMode(false); }

  function retakeByKey(key: string) {
    const idx = cameraSteps.findIndex((s) => s.key === key);
    stepChangeReasonRef.current = "retake";
    setPhotos((prev) => prev.filter((p) => p.key !== key));
    setViewingPhoto(null);
    setPreviewMode(false);
    setCurrentStep(idx >= 0 ? idx : 0);
    setDone(false);
  }

  // Called when clicking a captured thumbnail — jump to step AND enter preview
  function handleSelectCaptured(i: number) {
    // reason stays "navigate" → useEffect will see the photo exists and set previewMode=true
    setCurrentStep(i);
  }

  // ── Done Screen ──────────────────────────────────────────────
  if (done) {
    return (
      <div
        style={{
          width: "100vw", height: "100vh", background: "#0d0d0d",
          display: "flex", flexDirection: "column", alignItems: "center",
          overflowY: "auto", fontFamily: "Arial, sans-serif",
        }}
      >
        {viewingPhoto && (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)",
              zIndex: 200, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <p style={{
              position: "absolute", top: 22, left: 0, right: 0,
              textAlign: "center", color: "white", fontSize: 15,
              fontWeight: 700, margin: 0, letterSpacing: 0.3,
            }}>
              {cameraSteps.find((s) => s.key === viewingPhoto.key)?.label}
            </p>
            <button
              onClick={() => setViewingPhoto(null)}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 40, height: 40, borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.4)",
                background: "rgba(0,0,0,0.6)", color: "white",
                fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
            <img
              src={viewingPhoto.dataUrl}
              style={{
                maxWidth: "92%", maxHeight: "72vh",
                objectFit: "contain", borderRadius: 14,
                boxShadow: "0 0 40px rgba(0,0,0,0.8)",
              }}
              alt="Full view"
            />
            <button
              onClick={() => retakeByKey(viewingPhoto.key)}
              style={{
                marginTop: 28, padding: "13px 36px", borderRadius: 24,
                border: "1.5px solid rgba(255,180,60,0.75)",
                background: "rgba(0,0,0,0.55)", color: "rgba(255,200,80,1)",
                fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2,
              }}
            >🔄 Retake this photo</button>
          </div>
        )}

        <div style={{ width: "100%", maxWidth: 520, padding: "28px 16px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 46, marginBottom: 8 }}>✅</div>
            <p style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
              All photos captured!
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              {capturedCount} of {cameraSteps.length} photos
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {cameraSteps.map((s) => {
              const photo = photos.find((p) => p.key === s.key);
              return (
                <div
                  key={s.key}
                  style={{ borderRadius: 10, overflow: "hidden", position: "relative", background: "#1a1a1a" }}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.dataUrl}
                        onClick={() => setViewingPhoto(photo)}
                        style={{
                          width: "100%", aspectRatio: "4/3", objectFit: "cover",
                          display: "block", cursor: "pointer",
                        }}
                        alt={s.label}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); retakeByKey(s.key); }}
                        title="Retake this photo"
                        style={{
                          position: "absolute", top: 6, right: 6,
                          width: 30, height: 30, borderRadius: "50%",
                          border: "1.5px solid rgba(255,180,60,0.7)",
                          background: "rgba(0,0,0,0.65)", color: "rgba(255,200,80,1)",
                          fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >🔄</button>
                      <div style={{
                        position: "absolute", top: 6, left: 6,
                        background: "rgba(0,0,0,0.55)", borderRadius: 6,
                        padding: "2px 6px", color: "rgba(255,255,255,0.7)", fontSize: 9,
                      }}>tap to view</div>
                    </>
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 24 }}>—</span>
                    </div>
                  )}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                    color: "white", fontSize: 11, padding: "16px 8px 6px",
                    textAlign: "center", pointerEvents: "none",
                  }}>
                    {s.label}
                    {!photo && <span style={{ color: "rgba(255,100,100,0.8)" }}> ✕</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={restart}
              style={{
                flex: 1, padding: "13px", borderRadius: 24,
                border: "1.5px solid rgba(255,255,255,0.35)",
                background: "transparent", color: "white",
                fontSize: 14, cursor: "pointer",
              }}
            >Retake All</button>
            <button
              onClick={() => {
                const payload = cameraSteps.map((s) => {
                  const photo = photos.find((p) => p.key === s.key);
                  return {
                    key: s.key,
                    label: s.label,
                    captured: !!photo,
                    dataUrl: photo?.dataUrl ?? null,
                  };
                });
                console.log("=== Submit Photos ===");
                console.log("Total captured:", photos.length, "/", cameraSteps.length);
                console.log("Photos payload:", payload);
                payload.forEach((p) => {
                  console.log(
                    `[${p.captured ? "✓" : "✗"}] ${p.label} (${p.key})`,
                    p.dataUrl ? `— ${Math.round(p.dataUrl.length / 1024)}KB` : "— missing"
                  );
                });
              }}
              style={{
                flex: 1, padding: "13px", borderRadius: 24,
                border: "none", background: "white", color: "#0d0d0d",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >Submit Photos</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Camera Screen ────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#000", overflow: "hidden", fontFamily: "Arial, sans-serif" }}>

      {/* Live camera feed — hidden in preview mode */}
      <video
        ref={videoRef} autoPlay playsInline muted
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          display: previewMode ? "none" : "block", // ← hide video when previewing
        }}
      />
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />

      {/* ── PREVIEW MODE: show captured photo full-screen ── */}
      {previewMode && currentPhoto && (
        <div style={{
          position: "absolute", inset: 0, background: "#000",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 5,
        }}>
          <img
            src={currentPhoto.dataUrl}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
            }}
            alt={step.label}
          />
          {/* Subtle dark overlay for readability of UI on top */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.5) 100%)",
            pointerEvents: "none",
          }} />
        </div>
      )}

      {/* Flash effect */}
      {flash && (
        <div style={{ position: "absolute", inset: 0, background: "white", opacity: 0.75, zIndex: 50, pointerEvents: "none" }} />
      )}

      {/* Camera error */}
      {cameraError && !previewMode && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)", zIndex: 40 }}>
          <p style={{ color: "white", fontSize: 15, textAlign: "center", padding: 28 }}>{cameraError}</p>
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "18px 16px 12px 16px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 80%, transparent)",
          zIndex: 20, display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
        }}
      >
        <p style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: 0.3 }}>
          {step.label}
          {previewMode && (
            <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(100,255,180,0.9)", marginLeft: 8 }}>
              · Captured
            </span>
          )}
        </p>
        <StepDots total={cameraSteps.length} current={currentStep} photos={photos} steps={cameraSteps} onJump={setCurrentStep} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>
          {currentStep + 1} / {cameraSteps.length} · {capturedCount} captured
        </p>
      </div>

      {/* Centre area: frame + thumbnails — only shown when NOT in preview mode */}
      {!previewMode && (
        <div
          style={{
            position: "absolute", top: "11%", left: "4%", right: "4%", height: "68%",
            display: "flex", flexDirection: "column", alignItems: "center",
            zIndex: 10, pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%", flex: 1,
              border: `2px solid ${alreadyCaptured ? "rgba(100,255,180,0.7)" : "rgba(255,255,255,0.5)"}`,
              borderRadius: 20, background: "transparent",
              position: "relative", overflow: "hidden", transition: "border-color 0.3s",
            }}
          >
            <CarOverlay stepKey={step.key} captured={alreadyCaptured} />
            {[
              { top: 0, left: 0, borderWidth: "3px 0 0 3px", radius: "6px 0 0 0" },
              { top: 0, right: 0, borderWidth: "3px 3px 0 0", radius: "0 6px 0 0" },
              { bottom: 0, left: 0, borderWidth: "0 0 3px 3px", radius: "0 0 0 6px" },
              { bottom: 0, right: 0, borderWidth: "0 3px 3px 0", radius: "0 0 6px 0" },
            ].map((c, i) => (
              <div key={i} style={{
                position: "absolute", width: 22, height: 22,
                border: `${c.borderWidth} solid white`, borderRadius: c.radius,
                top: (c as any).top, right: (c as any).right,
                bottom: (c as any).bottom, left: (c as any).left,
              }} />
            ))}
          </div>

          <ThumbnailStrip
            photos={photos}
            steps={cameraSteps}
            currentStep={currentStep}
            onSelect={setCurrentStep}
            onSelectCaptured={handleSelectCaptured}
          />
        </div>
      )}

      {/* Thumbnail strip in preview mode (shown at bottom above controls) */}
      {previewMode && (
        <div style={{
          position: "absolute", bottom: "18%", left: 0, right: 0,
          zIndex: 20,
        }}>
          <ThumbnailStrip
            photos={photos}
            steps={cameraSteps}
            currentStep={currentStep}
            onSelect={setCurrentStep}
            onSelectCaptured={handleSelectCaptured}
          />
        </div>
      )}

      {/* Bottom controls */}
      <div
        style={{
          position: "absolute", bottom: "4%", left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 24, zIndex: 20,
        }}
      >
        {/* Back */}
        <button
          onClick={goBack} disabled={currentStep === 0}
          style={{
            width: 46, height: 46, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.45)", background: "rgba(0,0,0,0.45)",
            color: currentStep === 0 ? "rgba(255,255,255,0.2)" : "white",
            fontSize: 18, cursor: currentStep === 0 ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >‹</button>

        {/* Redo current — only in camera mode when already captured (preview mode uses the center 🔄 button) */}
        {/* {alreadyCaptured && !previewMode && (
          <button
            onClick={retake}
            style={{
              width: 46, height: 46, borderRadius: "50%",
              border: "1.5px solid rgba(255,180,60,0.7)", background: "rgba(0,0,0,0.45)",
              color: "rgba(255,200,80,1)", fontSize: 11, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >Redo</button>
        )} */}

        {/* Capture button — hidden in preview mode (no camera to capture from) */}
        {!previewMode && (
          <button
            onClick={capturePhoto}
            style={{
              width: 50, height: 50, borderRadius: "50%",
              border: "5px solid white",
              background: alreadyCaptured ? "rgba(100,255,180,0.28)" : "rgba(255,255,255,0.22)",
              cursor: "pointer", boxShadow: "0 0 0 6px rgba(255,255,255,0.16)",
              transition: "background 0.25s", position: "relative",
            }}
          >
            {alreadyCaptured && (
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)", width: 18, height: 18,
                borderRadius: "50%", background: "rgba(100,255,180,0.8)",
              }} />
            )}
          </button>
        )}

        {/* In preview mode, show a "Take New" button instead of capture */}
        {previewMode && (
          <button
            onClick={retake}
            style={{
              width: 50, height: 50, borderRadius: "50%",
              border: "5px solid rgba(255,180,60,0.8)",
              background: "rgba(0,0,0,0.5)",
              cursor: "pointer", boxShadow: "0 0 0 6px rgba(255,180,60,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}
          >🔄</button>
        )}

        {/* Skip / Next */}
        <button
          onClick={goNext}
          style={{
            width: 46, height: 46, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.45)", background: "rgba(0,0,0,0.45)",
            color: "white", fontSize: 11, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 1,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>›</span>
          <span style={{ fontSize: 9, opacity: 0.7, lineHeight: 1 }}>
            {currentStep < cameraSteps.length - 1 ? "Skip" : "Done"}
          </span>
        </button>
      </div>
    </div>
  );
}