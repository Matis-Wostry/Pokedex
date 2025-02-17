const Trainer = require("../models/Trainers");
const Pokemon = require("../models/Pokemon");

const createTrainer = async (req, res) => {
    try {
        const { trainerName, imgUrl } = req.body;
        const username = req.user.username;

        console.log(username);
        if (!username) {
            return res.status(400).json({ error: "Utilisateur non authentifié." });
        }

        // Vérifier si un dresseur existe déjà pour cet utilisateur
        const existingTrainer = await Trainer.findOne({ username });
        if (existingTrainer) {
            return res.status(400).json({ error: "Un dresseur est déjà associé à cet utilisateur." });
        }

        // Créer le dresseur
        const newTrainer = new Trainer({ username, trainerName, imgUrl });
        await newTrainer.save();

        res.status(201).json({ message: "Dresseur créé avec succès !", trainer: newTrainer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTrainer = async (req, res) => {
    try {
        const username = req.user.username; // Récupérer l'utilisateur connecté

        const trainer = await Trainer.findOne({ username });
        if (!trainer) {
            return res.status(404).json({ error: "Aucun dresseur trouvé pour cet utilisateur." });
        }

        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTrainer = async (req, res) => {
    try {
        const username = req.user.username;
        const updates = req.body; // Données à modifier

        // Trouver le dresseur
        const trainer = await Trainer.findOne({ username });
        if (!trainer) {
            return res.status(404).json({ error: "Aucun dresseur trouvé pour cet utilisateur." });
        }

        // Mettre à jour les champs fournis
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                trainer[key] = updates[key];
            }
        });

        await trainer.save();

        res.status(200).json({ message: "Dresseur mis à jour avec succès !", trainer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTrainer = async (req, res) => {
    try {
        const username = req.user.username;

        // Supprimer le dresseur
        const deletedTrainer = await Trainer.findOneAndDelete({ username });

        if (!deletedTrainer) {
            return res.status(404).json({ error: "Aucun dresseur trouvé pour cet utilisateur." });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markPokemon = async (req, res) => {
    try {
        const { pkmnID, isCaptured } = req.body;
        const username = req.user.username;

        // Vérifier si le dresseur existe
        const trainer = await Trainer.findOne({ username });
        if (!trainer) {
            return res.status(404).json({ error: "Dresseur non trouvé." });
        }

        // Vérifier si le Pokémon existe
        const pokemon = await Pokemon.findById(pkmnID);
        if (!pokemon) {
            return res.status(404).json({ error: "Pokémon non trouvé." });
        }

        // Ajouter le Pokémon dans la bonne liste
        if (isCaptured) {
            if (!trainer.pkmnCatch.includes(pkmnID)) {
                trainer.pkmnCatch.push(pkmnID);
            }
            // Assurer qu'il soit aussi marqué comme vu
            if (!trainer.pkmnSeen.includes(pkmnID)) {
                trainer.pkmnSeen.push(pkmnID);
            }
        } else {
            if (!trainer.pkmnSeen.includes(pkmnID)) {
                trainer.pkmnSeen.push(pkmnID);
            }
        }

        await trainer.save();

        res.status(200).json({
            message: `Pokémon ${isCaptured ? "capturé" : "vu"} avec succès !`,
            trainer
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTrainer, getTrainer, updateTrainer, deleteTrainer, markPokemon };
