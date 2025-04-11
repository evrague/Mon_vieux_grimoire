const express = require("express");
const router = express.Router();
const multer = require("multer");

// Confihuration du stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => cb(null, `${file.originalname.split(".")[0]}.webp`),
});

const upload = multer({ storage });

const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleWare");

router.get("/", bookController.getAllBooks);
router.get("/bestrating", bookController.getBestRatedBooks);
router.get("/:id", bookController.getBookById);

router.post("/", authMiddleware, upload.single("image"), bookController.createBook);
router.put("/:id", authMiddleware, upload.single("image"), bookController.updateBook);
router.delete("/:id", authMiddleware, bookController.deleteBook);
router.post("/:id/rating", authMiddleware, bookController.rateBook);


module.exports = router;
