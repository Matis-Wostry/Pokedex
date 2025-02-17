const PkmnType = require("../models/PkmnType");
const Pokemon = require("../models/Pokemon");

const getAllTypes = () => {
    return {
        data: PkmnType,
        count: PkmnType.length
    };
};

const createPokemon = async (data) => {
    const existingPokemon = await Pokemon.findOne({ name: data.name });
    if (existingPokemon) {
        throw new Error("Le Pokémon existe déjà.");
    }

    const newPokemon = new Pokemon(data);
    await newPokemon.save();
    return newPokemon;
};

const searchPokemon = async (filters, page = 1, size = 10) => {
    let filter = {};

    if (filters.partialName) {
        filter.name = { $regex: filters.partialName, $options: "i" };
    }
    if (filters.typeOne) {
        filter.types = { $in: [filters.typeOne.toLowerCase()] }; // 🔥 Convertit en minuscule
    }
    if (filters.typeTwo) {
        filter.types = { $in: [filters.typeTwo.toLowerCase()] }; // 🔥 Convertit en minuscule
    }

    console.log("🔍 Filtre appliqué :", filter);

    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * limit;

    const pokemons = await Pokemon.find(filter).skip(skip).limit(limit);
    const count = await Pokemon.countDocuments(filter);

    console.log(`✅ ${pokemons.length} Pokémon(s) trouvé(s) sur ${count}`);

    return { data: pokemons, count };
};


const getPokemonByIdOrName = async (id, name) => {
    if (id) return await Pokemon.findById(id);
    if (name) return await Pokemon.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    throw new Error("ID ou Nom requis.");
};

const updatePokemon = async (id, updates) => {
    const pokemon = await Pokemon.findById(id);
    if (!pokemon) throw new Error("Pokémon non trouvé.");

    Object.assign(pokemon, updates);
    await pokemon.save();
    return pokemon;
};

const deletePokemon = async (id) => {
    const deletedPokemon = await Pokemon.findByIdAndDelete(id);
    if (!deletedPokemon) throw new Error("Pokémon non trouvé.");
};

const addRegionToPokemon = async (pkmnID, regionName, regionPokedexNumber) => {
    const pokemon = await Pokemon.findById(pkmnID);
    if (!pokemon) throw new Error("Pokémon non trouvé.");

    const existingRegion = pokemon.regions.find(region => region.regionName === regionName);
    if (existingRegion) {
        existingRegion.regionPokedexNumber = regionPokedexNumber;
    } else {
        pokemon.regions.push({ regionName, regionPokedexNumber });
    }

    await pokemon.save();
    return pokemon;
};

const removeRegionFromPokemon = async (pkmnID, regionName) => {
    const pokemon = await Pokemon.findById(pkmnID);
    if (!pokemon) throw new Error("Pokémon non trouvé.");

    const newRegions = pokemon.regions.filter(region => region.regionName !== regionName);
    if (newRegions.length === pokemon.regions.length) {
        throw new Error("La région spécifiée n'existe pas pour ce Pokémon.");
    }

    pokemon.regions = newRegions;
    await pokemon.save();
    return pokemon;
};

module.exports = { getAllTypes, createPokemon, searchPokemon, getPokemonByIdOrName, updatePokemon, deletePokemon, addRegionToPokemon, removeRegionFromPokemon, searchPokemon };