"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Pill,
  User,
  Download,
  X,
  Plus,
} from "lucide-react";
import styles from "./patient.module.css";
import {
  getMedicalRecords,
  getPrescriptions,
  getAppointments,
  getPatientStats,
  addPatient,
  addAppointment,
  deleteAppointment,
  type MedicalRecord,
  type Prescription,
  type Appointment,
} from "@/utils/dataManager";

export default function PatientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [stats, setStats] = useState({
    nextAppointment: "None scheduled",
    activePrescriptions: 0,
    lastCheckup: "No records",
  });
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    time: "",
    doctor: "",
    type: "Consultation",
  });

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Patient";
    const email = localStorage.getItem("userEmail") || "";
    setUserName(name);
    setUserEmail(email);

    if (email) {
      addPatient({
        email,
        name,
        registeredAt: new Date().toISOString(),
      });
      loadPatientData(email);
    }
  }, []);

  const loadPatientData = (email: string) => {
    const records = getMedicalRecords(email);
    const presc = getPrescriptions(email);
    const appts = getAppointments(email).filter((a) => {
      const appointmentDate = new Date(a.date);
      return appointmentDate >= new Date() && a.status !== "cancelled";
    });
    const patientStats = getPatientStats(email);

    setMedicalHistory(records);
    setPrescriptions(presc);
    setUpcomingAppointments(appts);
    setStats(patientStats);
  };

  const downloadFile = (file: any) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const handleCancelAppointment = (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      deleteAppointment(id);
      loadPatientData(userEmail);
    }
  };

  const handleBookAppointment = () => {
    if (
      !newAppointment.date ||
      !newAppointment.time ||
      !newAppointment.doctor
    ) {
      alert("Please fill in all fields");
      return;
    }

    addAppointment({
      patientEmail: userEmail,
      patientName: userName,
      date: newAppointment.date,
      time: newAppointment.time,
      doctor: newAppointment.doctor,
      type: newAppointment.type,
      status: "scheduled",
    });

    setShowAppointmentModal(false);
    setNewAppointment({ date: "", time: "", doctor: "", type: "Consultation" });
    loadPatientData(userEmail);
    alert("Appointment booked successfully!");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <Shield className={styles.shieldIcon} />
            <div>
              <h1 className={styles.userName}>{userName}</h1>
              <p className={styles.userEmail}>{userEmail}</p>
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
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Next Appointment</p>
                <p className={styles.statValue}>{stats.nextAppointment}</p>
              </div>
              <Clock className={styles.statIconBlue} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Active Prescriptions</p>
                <p className={styles.statValue}>{stats.activePrescriptions}</p>
              </div>
              <Pill className={styles.statIconGreen} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <p className={styles.statLabel}>Last Check-up</p>
                <p className={styles.statValue}>{stats.lastCheckup}</p>
              </div>
              <CheckCircle className={styles.statIconPurple} />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Medical History */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FileText className={styles.titleIcon} />
                Medical History
              </h2>
            </div>
            {medicalHistory.length === 0 ? (
              <p style={{ padding: "1rem", color: "#6b7280" }}>
                No medical records yet.
              </p>
            ) : (
              <div className={styles.historyList}>
                {medicalHistory.map((record) => (
                  <div
                    key={record.id}
                    className={styles.historyCard}
                    onClick={() => setSelectedRecord(record)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.historyDate}>
                      <Calendar size={16} />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    <div className={styles.historyInfo}>
                      <h3 className={styles.historyEvent}>{record.event}</h3>
                      <p className={styles.historyDoctor}>
                        <User size={14} />
                        {record.doctor}
                      </p>
                      {record.files && record.files.length > 0 && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#4f46e5",
                            marginTop: "0.25rem",
                          }}
                        >
                          {record.files.length} file(s) attached
                        </p>
                      )}
                    </div>
                    <span className={styles.statusComplete}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Pill className={styles.titleIcon} />
                Active Prescriptions
              </h2>
            </div>
            {prescriptions.length === 0 ? (
              <p style={{ padding: "1rem", color: "#6b7280" }}>
                No active prescriptions.
              </p>
            ) : (
              <div className={styles.prescriptionList}>
                {prescriptions.map((med) => (
                  <div key={med.id} className={styles.prescriptionCard}>
                    <div className={styles.prescriptionIcon}>
                      <Pill size={24} />
                    </div>
                    <div className={styles.prescriptionInfo}>
                      <h3 className={styles.prescriptionName}>{med.name}</h3>
                      <p className={styles.prescriptionDosage}>
                        {med.dosage} - {med.frequency}
                      </p>
                      <p className={styles.prescriptionRemaining}>
                        {med.remaining} days remaining
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          marginTop: "0.25rem",
                        }}
                      >
                        Prescribed by: {med.prescribedBy}
                      </p>
                    </div>
                    <button className={styles.refillButton}>Refill</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Calendar className={styles.titleIcon} />
              Upcoming Appointments
            </h2>
            <button
              className={styles.newAppointmentButton}
              onClick={() => setShowAppointmentModal(true)}
            >
              + New Appointment
            </button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p style={{ padding: "1rem", color: "#6b7280" }}>
              No upcoming appointments. Click "New Appointment" to book one.
            </p>
          ) : (
            <div className={styles.appointmentGrid}>
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <div className={styles.appointmentDate}>
                      <Calendar size={20} />
                      <div>
                        <p className={styles.appointmentDay}>
                          {new Date(apt.date).toLocaleDateString()}
                        </p>
                        <p className={styles.appointmentTime}>{apt.time}</p>
                      </div>
                    </div>
                    <span className={styles.appointmentType}>{apt.type}</span>
                  </div>
                  <div className={styles.appointmentBody}>
                    <p className={styles.appointmentDoctor}>
                      <User size={16} />
                      {apt.doctor}
                    </p>
                    <div className={styles.appointmentActions}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancelAppointment(apt.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showAppointmentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAppointmentModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                Book New Appointment
              </h2>
              <button
                onClick={() => setShowAppointmentModal(false)}
                title="Close appointment modal"
                aria-label="Close appointment modal"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date</label>
                <input
                  type="date"
                  title="Appointment date"
                  placeholder="Select date"
                  className={styles.formInput}
                  value={newAppointment.date}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      date: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Time</label>
                <select
                  title="Appointment time"
                  className={styles.formInput}
                  value={newAppointment.time}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      time: e.target.value,
                    })
                  }
                >
                  <option value="">Select time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Doctor
                </label>
                <input
                  type="text"
                  value={newAppointment.doctor}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      doctor: e.target.value,
                    })
                  }
                  placeholder="e.g., Dr. Sarah Johnson"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Type</label>
                <select
                  title="Appointment type"
                  className={styles.formInput}
                  value={newAppointment.type}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Check-up">Check-up</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <button
                onClick={handleBookAppointment}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Detail Modal */}
      {selectedRecord && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedRecord(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                Record Details
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                title="Close record details"
                aria-label="Close record details"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>Date:</strong>{" "}
              {new Date(selectedRecord.date).toLocaleDateString()}
            </p>
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>Doctor:</strong> {selectedRecord.doctor}
            </p>
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>Status:</strong> {selectedRecord.status}
            </p>
            {selectedRecord.notes && (
              <p style={{ marginBottom: "1rem" }}>
                <strong>Notes:</strong> {selectedRecord.notes}
              </p>
            )}

            {selectedRecord.files && selectedRecord.files.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    marginBottom: "0.75rem",
                  }}
                >
                  Attached Files
                </h3>
                {selectedRecord.files.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: "500" }}>{file.name}</p>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {(file.size / 1024).toFixed(2)} KB • Uploaded by{" "}
                        {file.uploadedBy}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadFile(file)}
                      style={{
                        background: "#4f46e5",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
