const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");

// STRICT Basic Auth for all /admin routes
function adminAuth(req, res, next) {
  // Ensure non-empty credentials
  const user = (process.env.ADMIN_USER || "").trim();
  const pass = (process.env.ADMIN_PASS || "").trim();
  const expectedUser = user.length ? user : "admin";
  const expectedPass = pass.length ? pass : "changeme123";

  const hdr = req.headers.authorization || "";

  if (!hdr.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="Android Hub Admin", charset="UTF-8"');
    return res.status(401).send("Auth required");
  }

  let u = "", p = "";
  try {
    [u, p] = Buffer.from(hdr.split(" ")[1], "base64").toString().split(":");
  } catch {
    res.set("WWW-Authenticate", 'Basic realm="Android Hub Admin", charset="UTF-8"');
    return res.status(401).send("Invalid auth");
  }

  if (u === expectedUser && p === expectedPass) return next();

  res.set("WWW-Authenticate", 'Basic realm="Android Hub Admin", charset="UTF-8"');
  return res.status(401).send("Unauthorized");
}

router.use(adminAuth);

// Admin pages
router.get("/", admin.dashboard);
router.get("/registrations", admin.registrations);
router.get("/messages", admin.messages);
router.get("/uploads", admin.uploads);
router.get("/proof/:name", admin.downloadProof);

// CSV exports
router.get("/export/registrations.csv", admin.exportRegistrationsCsv);
router.get("/export/messages.csv", admin.exportMessagesCsv);

// 🔒 Force logout: returns 401 with a different realm to make browsers re-prompt
router.get("/logout", (req, res) => {
  res.set("WWW-Authenticate", 'Basic realm="Android Hub Admin (logout)", charset="UTF-8"');
  return res.status(401).send("Logged out");
});

module.exports = router;

