const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// Diagnostic
router.get("/google/config", authController.googleConfig);

// Google login
router.post("/google", authController.googleLogin);

module.exports = router;
