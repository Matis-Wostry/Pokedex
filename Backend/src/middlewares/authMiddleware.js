const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Accès refusé" });

    console.log("🔍 Token reçu :", token);

    if (!token) {
        console.log("❌ Aucun token fourni");
        return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.user = decoded;
        console.log("✅ Utilisateur authentifié :", req.user);
        next();
    } catch (error) {
        console.log("❌ Erreur de décodage du token :", error.message);
        res.status(401).json({ error: "Token invalide" });
    }
};

module.exports = { authenticate };
