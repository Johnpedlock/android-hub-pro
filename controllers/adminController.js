const path = require("path");
const fs = require("fs");
const store = require("../lib/store");

const uploadsDir = path.join(__dirname, "..", "uploads");

// ----- helpers for CSV -----
function esc(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows, headers) {
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => esc(r[h])).join(",")).join("\n");
  return head + "\n" + body + "\n";
}
// ---------------------------

exports.dashboard = (req, res) => {
  const regs = store.readAll("registrations.jsonl");
  const msgs = store.readAll("messages.jsonl");
  let proofCount = 0;
  try { proofCount = fs.readdirSync(uploadsDir).filter(f => !f.startsWith(".")).length; } catch {}
  res.render("pages/admin/dashboard", {
    title: "Admin Dashboard",
    counts: { regs: regs.length, msgs: msgs.length, proofs: proofCount }
  });
};

exports.registrations = (req, res) => {
  const regs = store.readAll("registrations.jsonl");
  res.render("pages/admin/registrations", { title: "Registrations", regs });
};

exports.messages = (req, res) => {
  const msgs = store.readAll("messages.jsonl");
  res.render("pages/admin/messages", { title: "Messages", msgs });
};

exports.uploads = (req, res) => {
  let files = [];
  try {
    files = fs.readdirSync(uploadsDir)
      .filter(f => !f.startsWith("."))
      .map(name => ({ name, size: fs.statSync(path.join(uploadsDir, name)).size }));
  } catch {}
  res.render("pages/admin/uploads", { title: "Proof Uploads", files });
};

exports.downloadProof = (req, res) => {
  const name = path.basename(req.params.name);
  const file = path.join(uploadsDir, name);
  if (!fs.existsSync(file)) return res.status(404).send("Not found");
  res.download(file, name);
};

// ----- CSV Exports (these were missing) -----
exports.exportRegistrationsCsv = (req, res) => {
  const rows = store.readAll("registrations.jsonl");
  const headers = ["_ts", "fullName", "email", "whatsapp", "note", "proof"];
  const csv = toCsv(rows, headers);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="registrations.csv"');
  res.send(csv);
};

exports.exportMessagesCsv = (req, res) => {
  const rows = store.readAll("messages.jsonl");
  const headers = ["_ts", "name", "email", "message"];
  const csv = toCsv(rows, headers);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="messages.csv"');
  res.send(csv);
};
