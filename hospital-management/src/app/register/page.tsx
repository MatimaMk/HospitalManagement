"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Activity, Users, Camera, Loader } from "lucide-react";
import styles from "./register.module.css";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [captureMessage, setCaptureMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceapiRef = useRef<any>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      // Dynamically import face-api only on client side
      if (typeof window !== 'undefined') {
        const faceapi = await import("@vladmandic/face-api");
        faceapiRef.current = faceapi;

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        setModelsLoaded(true);
        setCaptureMessage("Models loaded successfully");
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setCaptureMessage("Unable to load face recognition models");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && userType) {
      setStep(2);
    } else if (step === 2) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      setStep(3);
      startVideo();
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCaptureMessage("Camera ready. Click capture when ready.");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCaptureMessage("Camera access denied");
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setCaptureMessage("Camera not ready. Please try again.");
      return;
    }

    setCapturing(true);
    setCaptureMessage("Detecting face...");

    try {
      if (modelsLoaded && faceapiRef.current) {
        // Use face-api for detection if models are loaded
        const faceapi = faceapiRef.current;
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          if (ctx && videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);

            // Save face image to localStorage
            const faceImage = canvas.toDataURL("image/jpeg");
            const descriptor = Array.from(detections.descriptor);

            localStorage.setItem("userFaceImage", faceImage);
            localStorage.setItem("faceDescriptors", JSON.stringify([descriptor]));
            localStorage.setItem("userRole", userType);
            localStorage.setItem("userEmail", formData.email);
            localStorage.setItem("userName", formData.fullName);

            setCaptureMessage("Face captured successfully!");
            setCaptureComplete(true);

            // Stop video stream
            if (videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach((track) => track.stop());
            }

            setTimeout(() => {
              router.push("/login");
            }, 2000);
          }
        } else {
          setCaptureMessage(
            "No face detected. Please ensure your face is clearly visible."
          );
          setCapturing(false);
        }
      } else {
        // Fallback: capture image without face detection if models aren't loaded
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx && videoRef.current) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);

          // Save face image to localStorage (without descriptor)
          const faceImage = canvas.toDataURL("image/jpeg");

          localStorage.setItem("userFaceImage", faceImage);
          localStorage.setItem("userRole", userType);
          localStorage.setItem("userEmail", formData.email);
          localStorage.setItem("userName", formData.fullName);

          setCaptureMessage("Face image captured! (Recognition models not available)");
          setCaptureComplete(true);

          // Stop video stream
          if (videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
          }

          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error capturing face:", error);
      setCaptureMessage("Error capturing face. Please try again.");
      setCapturing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Shield className={styles.icon} />
          <h2 className={styles.title}>Create Your Account</h2>
          <p className={styles.subtitle}>Join SecureEHR in 3 simple steps</p>
        </div>

        <div className={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={styles.progressStep}>
              <div
                className={`${styles.stepCircle} ${
                  s <= step ? styles.stepActive : ""
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`${styles.stepLine} ${
                    s < step ? styles.lineActive : ""
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className={styles.card}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Select Your Role</h3>
              <div className={styles.roleGrid}>
                <button
                  onClick={() => setUserType("doctor")}
                  className={`${styles.roleCard} ${
                    userType === "doctor" ? styles.roleActive : ""
                  }`}
                >
                  <Activity className={styles.roleIcon} />
                  <div className={styles.roleTitle}>Medical Professional</div>
                  <div className={styles.roleDesc}>Doctor or Clinician</div>
                </button>
                <button
                  onClick={() => setUserType("patient")}
                  className={`${styles.roleCard} ${
                    userType === "patient" ? styles.roleActive : ""
                  }`}
                >
                  <Users className={styles.roleIcon} />
                  <div className={styles.roleTitle}>Patient</div>
                  <div className={styles.roleDesc}>Access your records</div>
                </button>
              </div>
              <button
                onClick={() => userType && setStep(2)}
                disabled={!userType}
                className={styles.continueButton}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h3 className={styles.stepTitle}>Your Information</h3>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={styles.input}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={styles.input}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={styles.input}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className={styles.continueButton}>
                Continue
              </button>
            </form>
          )}

          {step === 3 && (
            <div className={styles.faceCapture}>
              <h3 className={styles.stepTitle}>Facial Biometric Setup</h3>
              <p className={styles.faceSubtitle}>
                Position your face within the frame for secure registration
              </p>

              <div className={styles.videoContainer}>
                <video ref={videoRef} autoPlay muted className={styles.video} />
                <canvas ref={canvasRef} className={styles.canvas} />
                {captureComplete && (
                  <div className={styles.successOverlay}>
                    <div className={styles.successBadge}>
                      ✓ Face Captured Successfully!
                    </div>
                  </div>
                )}
                {captureMessage && !captureComplete && (
                  <div className={styles.captureMessage}>{captureMessage}</div>
                )}
              </div>

              {!captureComplete ? (
                <button
                  onClick={captureFace}
                  disabled={capturing}
                  className={styles.captureButton}
                  title={!modelsLoaded ? "Face recognition models not loaded - basic capture available" : "Capture your face for biometric authentication"}
                >
                  {capturing ? (
                    <>
                      <Loader className={styles.spinner} /> Processing...
                    </>
                  ) : (
                    <>
                      <Camera size={20} /> Capture Face
                    </>
                  )}
                </button>
              ) : (
                <div className={styles.redirecting}>
                  Redirecting to login...
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
              if (step === 3 && videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
              }
            } else {
              router.push("/");
            }
          }}
          className={styles.backLink}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
