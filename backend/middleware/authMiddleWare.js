const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant ou invalide" });
    }

    // Extraire le token après "Bearer "
    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    const decodedToken = jwt.verify(token, "3jK8d!zP@XqR$7tM^wL2vN6fG");
    req.auth = { userId: decodedToken.userId };
    next();

  } catch (error) {
    res.status(401).json({ error: "Requête non authentifiée !" });
  }
};
