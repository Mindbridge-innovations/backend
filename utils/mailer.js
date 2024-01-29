const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "MindBridge",
        link: "https://sites.google.com/view/bse24-10/home",
        // Optional product logo
        logo: "https://mindbridge-innovations.github.io/assets/images/MindBridgeLogo.jpeg"
    },
});

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port:465,
    secure:true,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendEmail = async(email, firstName)=>{
    const emailContent = mailGenerator.generate({
        body:{
            name: firstName,
            intro: "Welcome to MindBridge! We're very excited to have you on board.",
            action:{
                instructions: "To get started with MindBridge, please click here:",
                button:{
                    color: "#22BC66",
                    text: "Confirm your account",
                    // link: `${process.env.CLIENT_URL}/confirm/${email}`
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    })

    const mailOptions={
        from: `"MindBridge" ${process.env.EMAIL_USER}`,
        to: email,
        subject: "MindBridge Account Confirmation!",
        html: emailContent
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return "Email Sent";
      } catch (error) {
        console.log(error);
        throw error; // Rethrow the error to be handled by the caller
      }
};

module.exports = sendEmail;
