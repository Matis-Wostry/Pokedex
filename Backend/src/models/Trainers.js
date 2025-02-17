const mongoose = require("mongoose");

const TrainerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Correspond à l'utilisateur
    trainerName: { type: String, required: true }, // Nom du dresseur
    imgUrl: { type: String, default: "/medias/trainers/default.png" }, // Image du dresseur
    creationDate: { type: Date, default: Date.now }, // Date de création du dresseur
    pkmnSeen: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pokemon" }], // Liste des Pokémon vus
    pkmnCatch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pokemon" }], // Liste des Pokémon capturés
});

const Trainer = mongoose.model("Trainer", TrainerSchema);
module.exports = Trainer;
