const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Vérifier si le header Authorization est présent
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant ou invalide" });
    }

    // Extraire le token après "Bearer "
    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    const decodedToken = jwt.verify(token, "3jK8d!zP@XqR$7tM^wL2vN6fG"); // Remplace "SECRET_KEY" par ta clé secrète
    req.auth = { userId: decodedToken.userId }; // Stocke l'userId dans req.auth

    next();
  } catch (error) {
    res.status(401).json({ error: "Requête non authentifiée !" });
  }
};
