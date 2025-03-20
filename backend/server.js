const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "74827736",
  database: process.env.DB_NAME,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register endpoint (both customer and admin)
app.post("/api/register/:role", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const role = req.params.role === "admin" ? "admin" : "customer";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    db.query(
      "INSERT INTO users (firstName, lastName, email, password, role, verificationToken) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, role, verificationToken],
      (err) => {
        if (err) return res.status(400).json({ error: "Email already exists" });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify Your Email",
          html: `<p>Click <a href="http://localhost:5173/verify/${verificationToken}">here</a> to verify your email</p>`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error)
            return res.status(500).json({ error: "Email sending failed" });
          res.status(201).json({
            message: "Registration successful. Please verify your email.",
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Verify email
app.get("/api/verify/:token", (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ error: "Invalid token" });

    db.query(
      "UPDATE users SET isVerified = TRUE, verificationToken = NULL WHERE email = ?",
      [decoded.email],
      (error) => {
        if (error) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Email verified successfully" });
      }
    );
  });
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(400).json({ error: "Invalid credentials" });

      const user = results[0];
      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "You are not allowed to login from here" });
      }
      if (!user.isVerified) {
        return res
          .status(403)
          .json({ error: "Please verify your email first" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET
      );
      res.json({ token });
    }
  );
});

app.listen(3000, () => console.log("Server running on port 3000"));
