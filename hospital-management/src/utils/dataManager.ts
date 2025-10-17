// Data Manager for Hospital Management System
// Handles all localStorage operations for patients, doctors, and medical records

export interface MedicalRecord {
  id: string;
  patientEmail: string;
  date: string;
  event: string;
  doctor: string;
  status: string;
  notes?: string;
  files?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded
  uploadedBy: string;
  uploadedAt: string;
}

export interface Prescription {
  id: string;
  patientEmail: string;
  name: string;
  dosage: string;
  frequency: string;
  remaining: number;
  prescribedBy: string;
  prescribedDate: string;
}

export interface Appointment {
  id: string;
  patientEmail: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: string;
}

export interface Patient {
  email: string;
  name: string;
  age?: number;
  phone?: string;
  address?: string;
  registeredAt: string;
}

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Medical Records
export const getMedicalRecords = (patientEmail: string): MedicalRecord[] => {
  const records = localStorage.getItem('medicalRecords');
  if (!records) return [];
  const allRecords: MedicalRecord[] = JSON.parse(records);
  return allRecords.filter(r => r.patientEmail === patientEmail);
};

export const getAllMedicalRecords = (): MedicalRecord[] => {
  const records = localStorage.getItem('medicalRecords');
  return records ? JSON.parse(records) : [];
};

export const addMedicalRecord = (record: Omit<MedicalRecord, 'id'>): MedicalRecord => {
  const allRecords = getAllMedicalRecords();
  const newRecord: MedicalRecord = {
    ...record,
    id: generateId(),
  };
  allRecords.push(newRecord);
  localStorage.setItem('medicalRecords', JSON.stringify(allRecords));
  return newRecord;
};

export const updateMedicalRecord = (id: string, updates: Partial<MedicalRecord>): void => {
  const allRecords = getAllMedicalRecords();
  const index = allRecords.findIndex(r => r.id === id);
  if (index !== -1) {
    allRecords[index] = { ...allRecords[index], ...updates };
    localStorage.setItem('medicalRecords', JSON.stringify(allRecords));
  }
};

// Prescriptions
export const getPrescriptions = (patientEmail: string): Prescription[] => {
  const prescriptions = localStorage.getItem('prescriptions');
  if (!prescriptions) return [];
  const allPrescriptions: Prescription[] = JSON.parse(prescriptions);
  return allPrescriptions.filter(p => p.patientEmail === patientEmail);
};

export const getAllPrescriptions = (): Prescription[] => {
  const prescriptions = localStorage.getItem('prescriptions');
  return prescriptions ? JSON.parse(prescriptions) : [];
};

export const addPrescription = (prescription: Omit<Prescription, 'id'>): Prescription => {
  const allPrescriptions = getAllPrescriptions();
  const newPrescription: Prescription = {
    ...prescription,
    id: generateId(),
  };
  allPrescriptions.push(newPrescription);
  localStorage.setItem('prescriptions', JSON.stringify(allPrescriptions));
  return newPrescription;
};

// Appointments
export const getAppointments = (patientEmail: string): Appointment[] => {
  const appointments = localStorage.getItem('appointments');
  if (!appointments) return [];
  const allAppointments: Appointment[] = JSON.parse(appointments);
  return allAppointments.filter(a => a.patientEmail === patientEmail);
};

export const getAllAppointments = (): Appointment[] => {
  const appointments = localStorage.getItem('appointments');
  return appointments ? JSON.parse(appointments) : [];
};

export const addAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
  const allAppointments = getAllAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: generateId(),
  };
  allAppointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(allAppointments));
  return newAppointment;
};

export const updateAppointment = (id: string, updates: Partial<Appointment>): void => {
  const allAppointments = getAllAppointments();
  const index = allAppointments.findIndex(a => a.id === id);
  if (index !== -1) {
    allAppointments[index] = { ...allAppointments[index], ...updates };
    localStorage.setItem('appointments', JSON.stringify(allAppointments));
  }
};

export const deleteAppointment = (id: string): void => {
  const allAppointments = getAllAppointments();
  const filtered = allAppointments.filter(a => a.id !== id);
  localStorage.setItem('appointments', JSON.stringify(filtered));
};

// Patients
export const getAllPatients = (): Patient[] => {
  const patients = localStorage.getItem('patients');
  return patients ? JSON.parse(patients) : [];
};

export const getPatient = (email: string): Patient | null => {
  const patients = getAllPatients();
  return patients.find(p => p.email === email) || null;
};

export const addPatient = (patient: Patient): void => {
  const patients = getAllPatients();
  const exists = patients.find(p => p.email === patient.email);
  if (!exists) {
    patients.push(patient);
    localStorage.setItem('patients', JSON.stringify(patients));
  }
};

export const updatePatient = (email: string, updates: Partial<Patient>): void => {
  const patients = getAllPatients();
  const index = patients.findIndex(p => p.email === email);
  if (index !== -1) {
    patients[index] = { ...patients[index], ...updates };
    localStorage.setItem('patients', JSON.stringify(patients));
  }
};

// File Management
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const addFileToRecord = async (
  recordId: string,
  file: File,
  uploadedBy: string
): Promise<void> => {
  const base64Data = await fileToBase64(file);
  const attachment: FileAttachment = {
    id: generateId(),
    name: file.name,
    type: file.type,
    size: file.size,
    data: base64Data,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
  };

  const allRecords = getAllMedicalRecords();
  const record = allRecords.find(r => r.id === recordId);
  if (record) {
    if (!record.files) record.files = [];
    record.files.push(attachment);
    localStorage.setItem('medicalRecords', JSON.stringify(allRecords));
  }
};

// Statistics
export const getPatientStats = (patientEmail: string) => {
  const appointments = getAppointments(patientEmail);
  const prescriptions = getPrescriptions(patientEmail);
  const records = getMedicalRecords(patientEmail);

  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.date);
    return appointmentDate >= new Date() && a.status !== 'cancelled';
  });

  const nextAppointment = upcomingAppointments.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  const lastCheckup = records
    .filter(r => r.event.toLowerCase().includes('check'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return {
    nextAppointment: nextAppointment ? `${nextAppointment.date}` : 'None scheduled',
    activePrescriptions: prescriptions.length,
    lastCheckup: lastCheckup ? lastCheckup.date : 'No records',
    totalRecords: records.length,
    upcomingAppointmentsCount: upcomingAppointments.length,
  };
};

export const getDoctorStats = () => {
  const allPatients = getAllPatients();
  const allAppointments = getAllAppointments();

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = allAppointments.filter(a => a.date === today);

  const allRecords = getAllMedicalRecords();
  const pendingReviews = allRecords.filter(r => r.status === 'pending').length;

  return {
    totalPatients: allPatients.length,
    todayAppointments: todayAppointments.length,
    pendingReviews,
  };
};

// Clear all data (for testing/reset)
export const clearAllData = (): void => {
  localStorage.removeItem('medicalRecords');
  localStorage.removeItem('prescriptions');
  localStorage.removeItem('appointments');
  localStorage.removeItem('patients');
};
