"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Camera, Loader } from "lucide-react";
import styles from "./login.module.css";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [useFacialAuth, setUseFacialAuth] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
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
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setAuthMessage(
        "Face recognition models not available. Please use password login."
      );
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setAuthMessage("Camera access denied. Please use password login.");
    }
  };

  const detectFace = async () => {
    if (videoRef.current && canvasRef.current && modelsLoaded && faceapiRef.current) {
      const faceapi = faceapiRef.current;
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        setFaceDetected(true);
        setAuthMessage("Face detected! Verifying...");

        const storedDescriptors = localStorage.getItem("faceDescriptors");
        if (storedDescriptors) {
          const descriptors = JSON.parse(storedDescriptors);
          const distance = faceapi.euclideanDistance(
            detections.descriptor,
            descriptors[0]
          );

          if (distance < 0.6) {
            setAuthMessage("Authentication successful!");
            setTimeout(() => {
              const userRole = localStorage.getItem("userRole") || "patient";
              router.push(
                userRole === "doctor"
                  ? "/dashboard/doctor"
                  : "/dashboard/patient"
              );
            }, 1000);
            return;
          } else {
            setAuthMessage("Face not recognized. Please try again.");
            setFaceDetected(false);
          }
        } else {
          setAuthMessage("No registered face found. Please register first.");
        }
      } else {
        setAuthMessage("Scanning for face...");
        setFaceDetected(false);
      }
    }
    setTimeout(detectFace, 100);
  };

  const handleFacialAuth = async () => {
    setUseFacialAuth(true);
    setAuthMessage("Starting camera...");
    await startVideo();
    setTimeout(detectFace, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const userRole = formData.email.includes("doctor") ? "doctor" : "patient";
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userEmail", formData.email);
      router.push(
        userRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"
      );
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Shield className={styles.icon} />
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>
            Sign in to access your secure EHR system
          </p>
        </div>

        <div className={styles.card}>
          {!useFacialAuth ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={styles.input}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={styles.input}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.options}>
                <label className={styles.remember}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgot}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <Loader className={styles.spinner} /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              <button
                type="button"
                onClick={handleFacialAuth}
                className={styles.faceButton}
              >
                <Camera size={20} />
                Sign in with Facial Recognition
              </button>
            </form>
          ) : (
            <div className={styles.faceAuth}>
              <h3 className={styles.faceTitle}>Facial Authentication</h3>
              <p className={styles.faceSubtitle}>
                Position your face in the frame
              </p>

              <div className={styles.videoContainer}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className={styles.video}
                  onPlay={detectFace}
                />
                <canvas ref={canvasRef} className={styles.canvas} />
                {faceDetected && (
                  <div className={styles.faceDetectedBadge}>
                    Face Detected ✓
                  </div>
                )}
                {authMessage && (
                  <div className={styles.authMessage}>{authMessage}</div>
                )}
              </div>

              <button
                onClick={() => {
                  setUseFacialAuth(false);
                  if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach((track) => track.stop());
                  }
                }}
                className={styles.backButton}
              >
                Use Password Instead
              </button>
            </div>
          )}

          <div className={styles.register}>
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/register")}
                className={styles.registerLink}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <button onClick={() => router.push("/")} className={styles.homeLink}>
          ← Back to home
        </button>
      </div>
    </div>
  );
}
