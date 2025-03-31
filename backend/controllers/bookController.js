// ----- controllers/bookController.js -----
const Book = require("../models/Book");


exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(400).json({ error: "Erreur books" });
  }
};


exports.getBestRatedBooks = async (req, res) => {
  try {
    console.log(" API /api/books/bestrating appelée !");
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);

    res.status(200).json(bestRatedBooks);

  } catch (error) {
    console.log(error)
    res.status(400).json(error);
  }
}

exports.getBookById = async (req, res) =>{
  try {
    const book = await Book.findById(req.params.id);
    if(!book){
      return res.status(404).json({"message" : "Livre non trouve"});
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({error:"Erreur du createbook"});
  }
}

exports.createBook = async (req, res) => {
  try {
    const parsedBody = JSON.parse(req.body.book); 
    const title = parsedBody.title;
    const author = parsedBody.author;
    const year = parsedBody.year;
    const genre = parsedBody.genre;
    const grade = parsedBody.ratings[0].grade; 
    const userId = req.auth.userId;
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
    res.status(201).json(book);

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erreur " });
  }
}

exports.updateBook = async (req, res)=>{
  try {
    const {id} = req.params;

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

    res.status(200).json(book);
    
  } catch (error) {
    console.log(error);
    res.status(400).json({error:"Erreur du updatebook"});
  }
}

exports.deleteBook = async (req, res)=>{
  try {

    const {id} = req.params;
    const book = await Book.findById(id);

    await Book.deleteOne(book);
    return res.status(200).json({message : "Livre supprime avec Succes !"});
    
  } catch (error) {
    console.log(error);
    return res.status(400).json({error:"Erreur du deletebook"});
  }
}

exports.rateBook = async (req, res)=>{
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
    res.status(400).json({error:"Erreur rating"});
  }
}
