const nodemailer = rquire("nodemailer");
const Mailgen = require("mailgen");

const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "MindBridge",
        link: "https://sites.google.com/view/bse24-10/home",
        // Optional product logo
        logo: "../assets/images/MindBridgeLogo.jpeg"
    },
});
