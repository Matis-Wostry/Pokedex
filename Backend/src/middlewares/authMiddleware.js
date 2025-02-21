const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    console.log("🔍 Token reçu :", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ Aucun token valide fourni");
        return res.status(401).json({ error: "Accès refusé. Aucun token valide fourni." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        console.log("✅ Utilisateur authentifié :", req.user);
        next();
    } catch (error) {
        console.log("❌ Erreur de décodage du token :", error.message);
        res.status(401).json({ error: "Token invalide" });
    }
};

module.exports = { authenticate };
