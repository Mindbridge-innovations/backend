// utils/sendAppointmentEmail.js
const { db } = require('./firebaseConfig');
const sendEmail = require('./mailer'); // Ensure this path is correct

const sendAppointmentEmail = async (appointmentData, userId) => {
  const usersRef = db.ref('users');

  // Fetch user's username
  const userSnapshot = await usersRef.child(userId).once('value');
  const user = userSnapshot.val();
  const username = user ? user.username : "Unknown User";

  // Fetch therapist's email by checking the role
  const therapistSnapshot = await usersRef.child(appointmentData.therapistId).once('value');
  const therapist = therapistSnapshot.val();

  if (therapist && therapist.role === "therapist") {
    const therapistEmail = therapist.email;

    const emailBody = {
      body: {
        name: therapist.username,
        intro: `You have a new appointment booked by ${username}.`,
        table: {
          data: [
            { item: 'Date', description: appointmentData.date },
            { item: 'Time', description: appointmentData.time },
            { item: 'Reason', description: appointmentData.reason },
            { item: 'Description', description: appointmentData.description },
            { item: 'Type', description: appointmentData.appointmentType },
            { item: 'Status', description: appointmentData.status }
          ]
        },
        outro: 'Please log into the app to view more details.'
      }
    };
    await sendEmail(therapistEmail, "New Appointment Booked", emailBody);
  } else {
    console.error('Attempted to send an appointment email to a non-therapist user.');
  }
};

module.exports = sendAppointmentEmail;