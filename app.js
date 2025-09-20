const path = require("path");
const express = require("express");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine + layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Globals for views
app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || "Android Hub";
  res.locals.instructor = process.env.INSTRUCTOR_NAME || "Ituma Christian Uchenna";
  res.locals.fee = process.env.CLASS_FEE || "₦5,000";
  res.locals.whatsapp = process.env.WHATSAPP_PHONE || "";

  // payment + contact
  res.locals.opayProvider = process.env.OPAY_PROVIDER || "OPay";
  res.locals.opayAccount  = process.env.OPAY_ACCOUNT  || "";
  res.locals.contactEmail = process.env.CONTACT_EMAIL || "ceaseeser@gmail.com";
  next();
});

// Public routes
const routes = require("./routes/index");
app.use("/", routes);

// Admin routes (mount ONCE; no duplicate const)
app.use("/admin", require("./routes/admin"));

// 404 & 500
app.use((req, res) => res.status(404).render("pages/404", { title: "Page Not Found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("pages/500", { title: "Server Error" });
});

app.listen(PORT, () => {
  console.log(`✅ ${process.env.APP_NAME || "Android Hub"} running at http://localhost:${PORT}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

