"use client";
import { useRouter } from "next/navigation";
import {
  Camera,
  Shield,
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import styles from "./page.module.css";

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Camera,
      title: "Facial Recognition",
      description: "CNN-powered biometric authentication with 85%+ accuracy",
    },
    {
      icon: Shield,
      title: "Real-time Protection",
      description: "Instant anomaly detection under 50ms response time",
    },
    {
      icon: Activity,
      title: "HIPAA Compliant",
      description: "Non-reversible facial embeddings, no raw image storage",
    },
    {
      icon: AlertCircle,
      title: "Smart Alerts",
      description: "Real-time notifications for unauthorized access attempts",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate portals for doctors and patients",
    },
    {
      icon: CheckCircle,
      title: "Behavior Analysis",
      description: "AI monitors access patterns to detect suspicious activity",
    },
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Shield className={styles.logoIcon} />
            <span className={styles.logoText}>SecureEHR</span>
          </div>

          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>
              Features
            </a>
            <a href="#security" className={styles.navLink}>
              Security
            </a>
            <a href="#about" className={styles.navLink}>
              About
            </a>
          </div>

          <div className={styles.navButtons}>
            <button
              onClick={() => router.push("/login")}
              className={styles.loginButton}
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className={styles.getStartedButton}
            >
              Get Started
            </button>
          </div>

          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Secure Your
              <span className={styles.highlight}> Medical Records</span>
              <br />
              with AI
            </h1>
            <p className={styles.heroSubtitle}>
              Advanced CNN-powered facial recognition ensures only authorized
              access to sensitive Electronic Health Records
            </p>
            <div className={styles.heroButtons}>
              <button
                onClick={() => router.push("/register")}
                className={styles.primaryButton}
              >
                Start Free Trial
              </button>
              <button className={styles.secondaryButton}>Watch Demo</button>
            </div>
            <div className={styles.badges}>
              <div className={styles.badge}>
                <CheckCircle className={styles.badgeIcon} />
                <span>HIPAA Compliant</span>
              </div>
              <div className={styles.badge}>
                <CheckCircle className={styles.badgeIcon} />
                <span>85%+ Accuracy</span>
              </div>
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.heroCard}>
              <div className={styles.cameraPreview}>
                <Camera className={styles.cameraIcon} />
              </div>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>
                    Authentication Status
                  </span>
                  <span className={styles.statValueGreen}>Verified ✓</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Response Time</span>
                  <span className={styles.statValueBlue}>&lt;50ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.featuresContent}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Advanced Security Features</h2>
            <p className={styles.featuresSubtitle}>
              Powered by Convolutional Neural Networks
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, idx) => (
              <div key={idx} className={styles.featureCard}>
                <feature.icon className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
