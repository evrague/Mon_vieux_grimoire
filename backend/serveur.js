const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use("/images", express.static("images"));

// Connexion a Mongo DB
const connectDB = require("./config/db");
connectDB();

// Importation des Routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");


// Utilisation des API
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// DEfinition du Port d'ecoute du backend
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));