const pkmnService = require("../services/pkmnService");

const getTypes = (req, res) => {
    try {
        const types = pkmnService.getAllTypes();
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPokemon = async (req, res) => {
    try {
        const newPokemon = await pkmnService.createPokemon(req.body);
        res.status(201).json({ message: "Pokémon créé avec succès !", pokemon: newPokemon });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPokemon = async (req, res) => {
    try {
        const { id, name } = req.query;
        const pokemon = await pkmnService.getPokemonByIdOrName(id, name);
        if (!pokemon) return res.status(404).json({ error: "Pokémon non trouvé." });

        res.status(200).json(pokemon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePokemon = async (req, res) => {
    try {
        const updatedPokemon = await pkmnService.updatePokemon(req.body.id, req.body);
        res.status(200).json({ message: "Pokémon mis à jour avec succès !", pokemon: updatedPokemon });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePokemon = async (req, res) => {
    try {
        await pkmnService.deletePokemon(req.query.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const addRegionToPokemon = async (req, res) => {
    try {
        const { pkmnID, regionName, regionPokedexNumber } = req.body;
        const updatedPokemon = await pkmnService.addRegionToPokemon(pkmnID, regionName, regionPokedexNumber);
        res.status(200).json({ message: "Région ajoutée/modifiée avec succès !", pokemon: updatedPokemon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeRegionFromPokemon = async (req, res) => {
    try {
        const { pkmnID, regionName } = req.query;
        const updatedPokemon = await pkmnService.removeRegionFromPokemon(pkmnID, regionName);
        res.status(200).json({ message: "Région supprimée avec succès !", pokemon: updatedPokemon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchPokemon = async (req, res) => {
    try {
        const { partialName, typeOne, typeTwo, page = 1, size = 10 } = req.query;
        const result = await pkmnService.searchPokemon({ partialName, typeOne, typeTwo }, page, size);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTypes,
    createPokemon,
    getPokemon,
    updatePokemon,
    deletePokemon,
    addRegionToPokemon,
    removeRegionFromPokemon, 
    searchPokemon
};
