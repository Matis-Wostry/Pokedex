const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    // Dernière connexion réussie (à défaut, la création du compte). Sert à
    // supprimer les comptes inactifs : voir services/accountPurgeService.js.
    lastLoginAt: { type: Date, default: Date.now },
});

// Hash du mot de passe avant sauvegarde
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
