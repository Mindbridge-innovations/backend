// utils/appointment.js
const { getDatabase, ref, set,push } = require('firebase/database');
const { firebaseApp } = require('./firebaseConfig');

const createAppointment = async (userId, appointmentData) => {
  const db = getDatabase(firebaseApp);
  const appointmentsRef = ref(db, 'appointments');

  // Create a new appointment reference with a unique key
  const newAppointmentRef = push(appointmentsRef);

  // Construct the appointment object
  const newAppointment = {
    userId,
    date: appointmentData.date,
    time: appointmentData.time,
    reason: appointmentData.reason,
    description: appointmentData.description,
    appointmentType: appointmentData.appointmentType,
    therapistId:appointmentData.therapistId,
    status: appointmentData.status,
  };

  // Save the appointment to the database
  await set(newAppointmentRef, newAppointment);

  return { success: true, message: 'Appointment created successfully', appointmentId: newAppointmentRef.key };
};

module.exports = { createAppointment };