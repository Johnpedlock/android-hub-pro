const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const store = require("../lib/store");

// --- ensure uploads dir exists ---
const uploadsDir = path.join(__dirname, "..", "uploads");
function ensureUploadsDir() {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
}
ensureUploadsDir();

// Multer for proof uploads (PNG/JPG/PDF up to 10MB)
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureUploadsDir();
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const safe = (file.originalname || "file").replace(/\s+/g, "_");
      cb(null, Date.now() + "_" + safe);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const ok = /(png|jpg|jpeg|pdf)$/i.test(file.originalname || "");
    if (!ok) return cb(new Error("Only PNG, JPG, or PDF allowed"));
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

function waLink(number, text) {
  if (!number) return "";
  const msg = encodeURIComponent(text || "Hello, I just registered for the Advanced Class.");
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${msg}`;
}

async function maybeSendMail({ subject, html }) {
  const to = "ceaseeser@gmail.com"; // Hardcoded contact email
  if (!to || !process.env.SMTP_HOST) return; // skip if not configured
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: /^465$/.test(process.env.SMTP_PORT || "") ? true : false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM || to,
    to,
    subject,
    html,
  });
}

// Pages
exports.home = (req, res) => {
  res.render("pages/home", {
    title: "Advanced Class — Mastering Android Internals",
    wa: waLink(process.env.WHATSAPP_PHONE),
    contactEmail: "ceaseeser@gmail.com"
  });
};

exports.about = (req, res) => {
  res.render("pages/about", {
    title: "About Android Hub",
    contactEmail: "ceaseeser@gmail.com"
  });
};

exports.syllabus = (req, res) => {
  res.render("pages/syllabus", {
    title: "Syllabus — Advanced Class",
    contactEmail: "ceaseeser@gmail.com"
  });
};

// Register
exports.registerGet = (req, res) => {
  res.render("pages/register", {
    title: "Register — Advanced Class",
    errors: [],
    data: {},
    wa: waLink(process.env.WHATSAPP_PHONE, "I want to register."),
    contactEmail: "ceaseeser@gmail.com"
  });
};

exports.registerPost = [
  (req, res, next) => {
    upload.single("proof")(req, res, (err) => {
      if (!err) return next();
      const data = {
        fullName: req.body.fullName || "",
        email: req.body.email || "",
        whatsapp: req.body.whatsapp || "",
        note: req.body.note || ""
      };
      return res.status(400).render("pages/register", {
        title: "Register — Advanced Class",
        errors: [{ msg: err.message || "Upload failed" }],
        data,
        wa: "",
        contactEmail: "ceaseeser@gmail.com"
      });
    });
  },
  async (req, res) => {
    const errors = validationResult(req);
    const data = {
      fullName: req.body.fullName,
      email: req.body.email,
      whatsapp: req.body.whatsapp,
      note: req.body.note || "",
      proof: req.file ? req.file.filename : null
    };

    if (!errors.isEmpty()) {
      return res.status(400).render("pages/register", {
        title: "Register — Advanced Class",
        errors: errors.array(),
        data,
        wa: "",
        contactEmail: "ceaseeser@gmail.com"
      });
    }

    try {
      store.append("registrations.jsonl", data);
    } catch (e) {
      console.error("Save error:", e.message);
      return res.status(500).render("pages/register", {
        title: "Register — Advanced Class",
        errors: [{ msg: "Could not save your registration. Please try again." }],
        data,
        wa: "",
        contactEmail: "ceaseeser@gmail.com"
      });
    }

    try {
      await maybeSendMail({
        subject: "New Advanced Class Registration",
        html: `<h2>New Registration</h2>
          <p><b>Name:</b> ${data.fullName}</p>
          <p><b>Email:</b> ${data.email}</p>
          <p><b>WhatsApp:</b> ${data.whatsapp}</p>
          <p><b>Note:</b> ${data.note}</p>
          <p><b>Proof:</b> ${data.proof || "none"}</p>`
      });
    } catch (e) {
      console.error("Mail error:", e.message);
    }

    res.render("pages/register", {
      title: "Register — Advanced Class",
      errors: [],
      data: {},
      wa: "",
      success: "Registration received! We’ll confirm on WhatsApp and email with your class link after verifying your payment.",
      contactEmail: "ceaseeser@gmail.com"
    });
  }
];

// Contact
exports.contactGet = (req, res) => {
  res.render("pages/contact", {
    title: "Contact",
    errors: [],
    data: {},
    contactEmail: "ceaseeser@gmail.com"
  });
};

exports.contactPost = async (req, res) => {
  const errors = validationResult(req);
  const data = { name: req.body.name, email: req.body.email, message: req.body.message };

  if (!errors.isEmpty()) {
    return res.status(400).render("pages/contact", {
      title: "Contact",
      errors: errors.array(),
      data,
      contactEmail: "ceaseeser@gmail.com"
    });
  }

  try { store.append("messages.jsonl", data); } catch (e) { console.error("Save msg error:", e.message); }

  try {
    await maybeSendMail({
      subject: "New Contact Message",
      html: `<p><b>${data.name}</b> (${data.email}) says:</p><p>${data.message}</p>`
    });
  } catch (e) { console.error("Mail error:", e.message); }

  res.render("pages/contact", {
    title: "Contact",
    errors: [],
    data: {},
    success: "Thanks! We received your message and will get back to you shortly.",
    contactEmail: "ceaseeser@gmail.com"
  });
};

