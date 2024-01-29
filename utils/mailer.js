const nodemailer = rquire("nodemailer");
const Mailgen = require("mailgen");

const mailGenerator = new Mailgen({
    theme: "cerberus",
    product: {
        name: "MindBridge",
        link: "https://sites.google.com/view/bse24-10/home",
        // Optional product logo
        logo: "../assets/images/MindBridgeLogo.jpeg"
    },
});

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port:465,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
