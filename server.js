const express = require("express");
const cors = require("cors");
const { Connection, Keypair } = require("@solana/web3.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Middleware
app.use(cors());
app.use(express.json());

// Generate a 28-digit alphanumeric key
const generateKey = () => {
  return crypto.randomBytes(14).toString("hex");
};

// Encrypt the key
const encryptKey = (key) => {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Send recovery email
const sendEmail = (email, key) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "CASSEXCHANGE Key Recovery",
    text: `Your recovery key is: ${key}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// Routes
app.post("/register", (req, res) => {
  const { email } = req.body;
  const key = generateKey();
  const encryptedKey = encryptKey(key);

  // Save user data to the database (you’ll need to set up a database)
  // For now, we’ll just log the key
  console.log(`User registered: ${email}, Key: ${encryptedKey}`);

  // Send recovery email
  sendEmail(email, key);

  res.json({ message: "Registration successful!", key });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
