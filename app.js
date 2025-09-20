require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const PORT = process.env.PORT || 10000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Global template variables
app.locals.appName = process.env.APP_NAME || "Android Hub";
app.locals.instructor = process.env.INSTRUCTOR || "Ituma Christian Uchenna"; // ✅ updated
app.locals.title = "Mastering Android Internals"; // default title
app.locals.fee = process.env.FEE || "₦5000"; // ✅ default fee
app.locals.whatsapp = process.env.WHATSAPP || "+2348012345678"; // ✅ default WhatsApp

// Routes
app.use("/", require("./routes/index"));
app.use("/admin", require("./routes/admin"));

// Health check (for Render/monitoring)
app.get("/health", (req, res) => {
  res.status(200).send("✅ OK");
});

// 404 handler
app.use((req, res) =>
  res.status(404).render("pages/404", { title: "Page Not Found" })
);

// 500 handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("pages/500", { title: "Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ ${app.locals.appName} running on port ${PORT}`);
});
