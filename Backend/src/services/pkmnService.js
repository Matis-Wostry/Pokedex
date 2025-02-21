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
    
    const newPokemon = new Pokemon({
        name: data.name,
        nationalDexId: data.nationalDexId,
        types: data.types,
        regions: data.regions || [],
        hp: data.hp,
        attack: data.attack,
        defense: data.defense,
        specialAttack: data.specialAttack,
        specialDefense: data.specialDefense,
        speed: data.speed,
        description: data.description,
        image: data.image,
        weight: data.weight,
        height: data.height,
        moves: data.moves,
        abilities: data.abilities,
        cri: data.cri
    });

    await newPokemon.save();
    return newPokemon;
};


const searchPokemon = async (filters, page = 1, size = 10) => {
    let filter = {};

    if (filters.partialName) {
        filter.name = { $regex: filters.partialName, $options: "i" };
    }
    if (filters.typeOne) {
        filter.types = { $in: [filters.typeOne.toUpperCase()] };
    }
    if (filters.typeTwo) {
        filter.types = { $in: [filters.typeTwo.toUpperCase()] };
    }

    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * limit;

    const pokemons = await Pokemon.find(filter, "name").skip(skip).limit(limit);
    const count = await Pokemon.countDocuments(filter);

    return {
        count,
        results: pokemons.map(pokemon => ({
            name: pokemon.name.toLowerCase(),
            url: `/api/pkmn?id=${pokemon._id}` // Garder l'URL actuelle
        }))
    };
};


const getPokemonByIdOrName = async (id, name) => {
    let pokemon;
    if (id) {
        pokemon = await Pokemon.findById(id);
    } else if (name) {
        pokemon = await Pokemon.findOne({ name: new RegExp(`^${name}$`, "i") });
    }

    if (!pokemon) throw new Error("Pokémon non trouvé.");

    return {
        id: pokemon._id,
        nationalDexId: pokemon.nationalDexId,
        name: pokemon.name.toLowerCase(),
        weight: pokemon.weight,
        height: pokemon.height,
        moves: pokemon.moves.map(move => ({ move: { name: move.toLowerCase() } })),
        abilities: pokemon.abilities.map(ability => ({ ability: { name: ability.toLowerCase() } })),
        cri: pokemon.cri,
        stats: [
            { stat: { name: "hp" }, base_stat: pokemon.hp },
            { stat: { name: "attack" }, base_stat: pokemon.attack },
            { stat: { name: "defense" }, base_stat: pokemon.defense },
            { stat: { name: "special-attack" }, base_stat: pokemon.specialAttack },
            { stat: { name: "special-defense" }, base_stat: pokemon.specialDefense },
            { stat: { name: "speed" }, base_stat: pokemon.speed }
        ],
        types: pokemon.types.map(type => ({ type: { name: type.toLowerCase() } }))
    };
};

const updatePokemon = async (id, updates) => {
    const pokemon = await Pokemon.findById(id);
    if (!pokemon) throw new Error("Pokémon non trouvé.");

    const allowedFields = ["name", "hp", "attack", "defense", "specialAttack", "specialDefense", "speed", "types", "image", "description", "weight", "height", "moves", "abilities", "cri"];
    Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] !== undefined) {
            pokemon[key] = updates[key];
        }
    });

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