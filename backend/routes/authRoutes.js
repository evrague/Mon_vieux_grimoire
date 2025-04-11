const express = require("express");
const { signup, login } = require("../controllers/userController");
const router = express.Router();

// Pour chaque chemin, j'associe une fonction API
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;

