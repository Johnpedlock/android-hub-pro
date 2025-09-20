const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const page = require("../controllers/pageController");

router.get("/", page.home);
router.get("/about", page.about);
router.get("/syllabus", page.syllabus);

router.get("/register", page.registerGet);
router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("whatsapp").trim().notEmpty().withMessage("WhatsApp number is required")
  ],
  page.registerPost
);

router.get("/contact", page.contactGet);
router.post(
  "/contact",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("message").trim().isLength({ min: 10 }).withMessage("Message is too short")
  ],
  page.contactPost
);

module.exports = router;

