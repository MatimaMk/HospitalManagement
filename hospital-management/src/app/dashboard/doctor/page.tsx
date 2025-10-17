"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Clock,
  Activity,
  AlertCircle,
  Bell,
  Search,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react";
import styles from "./doctor.module.css";

export default function DoctorDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Doctor";
    setUserName(name);
  }, []);

  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      lastVisit: "2025-10-15",
      condition: "Hypertension",
      status: "stable",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 32,
      lastVisit: "2025-10-16",
      condition: "Diabetes",
      status: "monitoring",
    },
    {
      id: 3,
      name: "Bob Johnson",
      age: 58,
      lastVisit: "2025-10-14",
      condition: "Arthritis",
      status: "stable",
    },
    {
      id: 4,
      name: "Alice Brown",
      age: 41,
      lastVisit: "2025-10-17",
      condition: "Asthma",
      status: "stable",
    },
  ];

  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Unusual login attempt detected from new location",
      time: "2 min ago",
      location: "Cape Town",
    },
    {
      id: 2,
      type: "success",
      message: "System security scan completed successfully",
      time: "1 hour ago",
      location: null,
    },
    {
      id: 3,
      type: "info",
      message: "New patient record accessed",
      time: "3 hours ago",
      location: null,
    },
  ];

  const appointments = [
    { id: 1, patient: "John Doe", time: "09:00 AM", type: "Follow-up" },
    { id: 2, patient: "Jane Smith", time: "10:30 AM", type: "Consultation" },
    { id: 3, patient: "Bob Johnson", time: "02:00 PM", type: "Check-up" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <Shield className={styles.shieldIcon} />
            <div>
              <h1 className={styles.userName}>{userName}</h1>
              <p className={styles.userRole}>Medical Professional</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <div className={styles.main}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Total Patients</p>
                <p className={styles.statValue}>247</p>
              </div>
              <Users className={styles.statIconBlue} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Today's Appointments</p>
                <p className={styles.statValue}>12</p>
              </div>
              <Clock className={styles.statIconGreen} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Pending Reviews</p>
                <p className={styles.statValue}>8</p>
              </div>
              <Activity className={styles.statIconYellow} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Security Alerts</p>
                <p className={styles.statValue}>3</p>
              </div>
              <AlertCircle className={styles.statIconRed} />
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Patients</h2>
                <div className={styles.searchBox}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
              <div className={styles.patientList}>
                {patients.map((patient) => (
                  <div key={patient.id} className={styles.patientCard}>
                    <div className={styles.patientInfo}>
                      <div className={styles.patientAvatar}>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className={styles.patientName}>{patient.name}</h3>
                        <p className={styles.patientDetails}>
                          Age: {patient.age} | {patient.condition}
                        </p>
                      </div>
                    </div>
                    <div className={styles.patientMeta}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[patient.status]
                        }`}
                      >
                        {patient.status}
                      </span>
                      <p className={styles.lastVisit}>
                        Last visit: {patient.lastVisit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <Calendar className={styles.titleIcon} />
                  Today's Schedule
                </h2>
              </div>
              <div className={styles.appointmentList}>
                {appointments.map((apt) => (
                  <div key={apt.id} className={styles.appointmentCard}>
                    <div className={styles.appointmentTime}>{apt.time}</div>
                    <div className={styles.appointmentDetails}>
                      <p className={styles.appointmentPatient}>{apt.patient}</p>
                      <p className={styles.appointmentType}>{apt.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Bell className={styles.titleIcon} />
                Security Alerts
              </h2>
              <div className={styles.alertList}>
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`${styles.alertCard} ${styles[alert.type]}`}
                  >
                    <AlertCircle className={styles.alertIcon} />
                    <div className={styles.alertContent}>
                      <p className={styles.alertMessage}>{alert.message}</p>
                      {alert.location && (
                        <p className={styles.alertLocation}>
                          <MapPin size={14} /> {alert.location}
                        </p>
                      )}
                      <p className={styles.alertTime}>{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionGrid}>
                <button className={styles.actionButton}>
                  <FileText size={20} />
                  <span>New Record</span>
                </button>
                <button className={styles.actionButton}>
                  <Calendar size={20} />
                  <span>Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
