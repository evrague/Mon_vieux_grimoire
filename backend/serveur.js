const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//const { type } = require("@testing-library/user-event/dist/type");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());


// Connexion a mon MongoDB Atlas (En ligne)
mongoose.connect(process.env.MONGO_URI)
.then( ()=> console.log("Connection avec succes") )
.catch(err => console.log("Erreur de conection", err));

// Le port de connection de mon application
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));

// Creation du Schema de validation : User
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Creation du Schema de validation : Book
const BookSchema = new mongoose.Schema({
    userId: {type: Number, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    imageUrl: String,
    year: Number,
    genre: String,
    ratings: [
        {
            userId: Number,
            grade: Number
        }
    ],
    averageRating: Number

});

const User = mongoose.model("User", UserSchema);

// Api pour recuperer tous les users de la base de donnees MongoDB
app.get("/api/auth/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.post("/api/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "L'utilisateur existe déjà" });
        }

        // Hasher le mot de passe avant de l'enregistrer
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel utilisateur
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "Utilisateur créé avec succès" });

    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


const Book = mongoose.model("Book", BookSchema);


app.post("/api/auth/login", async (req,res)=>{

  try {

    const {email, password} = req.body;

    // Vérifier si l'utilisateur existe déjà
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "Email ou mot de passe incorrect" });
    }

    // verfier le mot de passe si correcte
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(400).json({error: "Email ou mot de passe incorrect"});
    }

    // generer le token
    const token = jwt.sign(
      {userId: user._id},
      process.env.JWT_SECRET_TOKEN,
      {expiresIn: "3h" }
    );

    res.json({token, userId:user._id});
    
  } catch (error) {
    res.status(500).json({error:"erreur du serveur de connection"});
  }

});