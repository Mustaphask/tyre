import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, run } from "./db.js";

dotenv.config();
initDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));

function validateContact(body) {
  const name = String(body?.name || "").trim();
  const mobile = String(body?.mobile || "").trim();
  const email = String(body?.email || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || name.length < 2) return "Name is required.";
  if (!mobile || mobile.length < 6) return "Mobile number is required.";
  if (!email.includes("@") || email.length < 5) return "Valid email is required.";
  if (!message || message.length < 3) return "Message is required.";

  return null;
}

function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

app.post("/api/contact", async (req, res) => {
  try {
    const err = validateContact(req.body);
    if (err) return res.status(400).json({ error: err });

    const name = String(req.body.name).trim();
    const mobile = String(req.body.mobile).trim();
    const email = String(req.body.email).trim();
    const message = String(req.body.message).trim();
    const createdAt = new Date().toISOString();

    // Save to DB
    const result = await run(
      `INSERT INTO contact_messages (name, mobile, email, message, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [name, mobile, email, message, createdAt]
    );

    // Send email (if SMTP configured)
    const transport = makeTransport();
    const to = process.env.CONTACT_TO_EMAIL;

    let emailSent = false;

    if (transport && to) {
      const from = process.env.MAIL_FROM || "no-reply@tyre.local";
      const subject = `New Contact Message — ${name}`;

      const text =
        `New message received:\n\n` +
        `Name: ${name}\n` +
        `Mobile: ${mobile}\n` +
        `Email: ${email}\n` +
        `Time: ${createdAt}\n\n` +
        `Message:\n${message}\n`;

      await transport.sendMail({
        from,
        to,
        subject,
        text,
        replyTo: email
      });

      emailSent = true;
    }

    return res.json({
      ok: true,
      id: result.lastID,
      saved: true,
      emailSent
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error." });
  }
});

// SPA-ish fallback: open index.html for unknown routes (optional)
// app.get("*", (_, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`);
});
