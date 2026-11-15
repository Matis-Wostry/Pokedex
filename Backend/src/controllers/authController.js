const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { TOKEN_LIFETIME } = require("../config/auth");

const SECRET_KEY = process.env.SECRET_KEY;

// Inscription
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "Utilisateur non trouvé" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe incorrect" });

        // Repousse la suppression du compte pour inactivité.
        await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: TOKEN_LIFETIME }
        );
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Vérifier l'utilisateur connecté
const checkUser = (req, res) => {
    res.json({ user: req.user });
};

module.exports = { register, login, checkUser };
