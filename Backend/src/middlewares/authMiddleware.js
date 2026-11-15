const jwt = require("jsonwebtoken");
const { TOKEN_LIFETIME } = require("../config/auth");
const SECRET_KEY = process.env.SECRET_KEY;

// Rien n'est écrit dans les journaux ici : ni le jeton (il suffirait à se
// faire passer pour l'utilisateur), ni son contenu.
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Accès refusé. Aucun token valide fourni." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // maxAge refuse aussi les anciens jetons, émis sans date d'expiration
        // avant que la durée de vie soit limitée.
        req.user = jwt.verify(token, SECRET_KEY, { maxAge: TOKEN_LIFETIME });
        next();
    } catch (error) {
        res.status(401).json({ error: "Token invalide" });
    }
};

module.exports = { authenticate };
