// utils/appointment.js
const { admin, db } = require('./firebaseConfig');

const createAppointment = async (userId, appointmentData) => {
  const appointmentsRef = db.ref('appointments');

  // Create a new appointment reference with a unique key
  const newAppointmentRef = appointmentsRef.push();

  // Construct the appointment object
  const newAppointment = {
    userId,
    date: appointmentData.date,
    time: appointmentData.time,
    reason: appointmentData.reason,
    description: appointmentData.description,
    appointmentType: appointmentData.appointmentType,
    therapistId: appointmentData.therapistId,
    status: appointmentData.status,
  };

  // Save the appointment to the database
  await newAppointmentRef.set(newAppointment);

  return { success: true, message: 'Appointment created successfully', appointmentId: newAppointmentRef.key };
};

module.exports = { createAppointment };