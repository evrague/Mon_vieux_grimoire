const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connecté avec succès");
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;