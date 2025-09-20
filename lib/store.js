const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

exports.append = (file, record) => {
  ensureDir();
  const line = JSON.stringify({ ...record, _ts: new Date().toISOString() }) + "\n";
  fs.appendFileSync(path.join(DATA_DIR, file), line, "utf8");
};

exports.readAll = (file) => {
  ensureDir();
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((ln) => {
      try { return JSON.parse(ln); } catch { return null; }
    })
    .filter(Boolean)
    .reverse(); // newest first
};
