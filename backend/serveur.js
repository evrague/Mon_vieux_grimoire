const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const bodyParser = require('body-parser');
const authMiddleware = require("./authMiddleWare");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json()) ;

app.use("/images", express.static("images"));
// for parsing application/json app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


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
    userId: {type: String, required: false},
    title: {type: String, required: false},
    author: {type: String, required: false},
    imageUrl: String,
    year: Number,
    genre: String,
    ratings: [
        {
            userId: String,
            grade: Number
        }
    ],
    averageRating: Number

});

const User = mongoose.model("User", UserSchema);
const Book = mongoose.model("Book", BookSchema);

//USERS

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
      res.status(400).json({ error: "Erreur signup" });
  }
});


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
    res.status(400).json({error:"erreur du serveur de connection"});
  }

});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: "Erreur user" });
  }
});

// Books

// Api pour recuperer tous les livres de la base de donnees MongoDB
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();
    return res.json(books);
  } catch (error) {
    res.status(400).json({ error: "Erreur books" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // 📂 Stocke les images dans le dossier "images"
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post("/api/books", authMiddleware, upload.single("image"), async (req, res) => {

  try {
  
    const parsedBody = JSON.parse(req.body.book); 
    const title = parsedBody.title;
    const author = parsedBody.author;
    const year = parsedBody.year;
    const genre = parsedBody.genre;
    const grade = parsedBody.ratings[0].grade; 
    const userId = req.auth.userId;
    console.log("le userID est = : ", userId);
    const host = req.get('host');
    const imageUrl = `${req.protocol}://${host}/images/${req.file.filename}`;

    // Création du livre
    const book = new Book({
      userId,
      title,
      author,
      imageUrl,
      year,
      genre,
      ratings: [{ userId, grade }],
      averageRating: grade,
    });

    await book.save();
    
    return res.status(201).json(book);

  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Erreur " });
  }
});

app.get("/api/books/bestrating", async (req, res)=>{
  try {
    console.log(" API /api/books/bestrating appelée !");
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);

    return res.status(200).json(bestRatedBooks);

  } catch (error) {
    console.log(error)
    res.status(400).json(error);
  }
});


app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if(!book){
      return res.status(404).json({"message" : "Livre non trouve"});
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({error:"Erreur du createbook"});
  }
});

app.put("/api/books/:id",  authMiddleware, upload.single("image"), async (req, res)=>{
  try {
    const {id} = req.params;
    const userId = req.auth.userId;

    const book = await Book.findById(id);
    console.log(req.body);
    
    if (req.file){
      const host = req.get('host');
      const imageUrl = `${req.protocol}://${host}/images/${req.file.filename}`;
    }

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.year = req.body.year || book.year;
    book.genre = req.body.genre || book.genre;
    book.grade = req.body.grade || book.grade;
    book.imageUrl = book.imageUrl || imageUrl;

    await book.save();

    return res.status(200).json(book);
    
  } catch (error) {
    console.log(error);
    return res.status(400).json({error:"Erreur du updatebook"});
  }
});

app.delete("/api/books/:id", authMiddleware, async (req, res)=>{
  try {

    const {id} = req.params;
    const userId = req.auth.userId;

    const book = await Book.findById(id);

    await Book.deleteOne(book);

    return res.status(200).json({message : "Livre supprime avec Succes !"});
    
  } catch (error) {
    console.log(error);
    return res.status(400).json({error:"Erreur du deletebook"});
  }
});



app.post("/api/books/:id/rating", authMiddleware, async (req, res)=>{
  try {
    const bookId = req.params.id;
    const userId = req.auth.userId;
    const grade = req.body.rating; 

    const book = await Book.findById(bookId);

    book.ratings.push({userId, grade});

    // calcule de moyenne des ratings
    const nombreDeRatings = book.ratings.length;
    const sommeRatings = book.ratings.reduce((sum, rating)=> sum + rating.grade, 0);
    book.averageRating = sommeRatings / nombreDeRatings ;

    book.save();

    res.status(200).json(book);

  } catch (error) {
    return res.status(400).json({error:"Erreur rating"});
  }
})


