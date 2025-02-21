const mongoose = require("mongoose");

const PokemonSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    nationalDexId: { type: Number, required: true },
    types: { type: [String], required: true },
    regions: [{
        regionName: { type: String, required: true },
        regionPokedexNumber: { type: Number, required: true }
    }],
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    specialAttack: { type: Number, required: true },
    specialDefense: { type: Number, required: true },
    speed: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    weight: { type: Number, required: true }, 
    height: { type: Number, required: true },
    moves: [{ type: String, required: true }],
    abilities: [{ type: String, required: true }],
    cri: { type: String, required: true },

});

const Pokemon = mongoose.model("Pokemon", PokemonSchema);
module.exports = Pokemon;
