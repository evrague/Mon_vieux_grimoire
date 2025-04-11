// ----- controllers/userController.js -----
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.signup = async (req, res) =>{
  try {
        const { email, password } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) { return res.status(400).json({ error: "L'utilisateur existe déjà" });}
        
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
        res.status(400).json({ error: "Erreur signup" });
    }
}

exports.login = async (req,res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Ce compte n'existe pas !" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET_TOKEN, 
      { expiresIn: "3h" }
    );
    res.json({ token, userId: user._id });
    console.log({ token, userId: user._id });
    
  } catch (error) {
    res.status(400).json({ message: "Erreur du serveur de connexion" });
  }
}


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
};
