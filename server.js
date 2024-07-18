const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 4,
  message: "Trop de requêtes !, veuillez réessayer après 15 minutes.",
});

app.use("/contact", limiter);

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  console.log(name, email, message);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true pour utiliser SSL/TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    replyTo: email,
    to: process.env.TO_EMAIL,
    subject: `Nouveau message de contact (${name})`,
    text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      res.status(500).send("Erreur lors de l'envoi du message.");
    } else {
      console.log("Email envoyé:", info.response);
      res.status(200).send("Message envoyé avec succès.");
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
