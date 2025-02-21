const Trainer = require("../models/Trainer");

const createTrainer = async (username, trainerName, imgUrl) => {
    const existingTrainer = await Trainer.findOne({ username });
    if (existingTrainer) {
        throw new Error("Un dresseur est déjà associé à cet utilisateur.");
    }

    const newTrainer = new Trainer({ username, trainerName, imgUrl });
    await newTrainer.save();
    return newTrainer;
};

const getTrainer = async (username) => {
    const trainer = await Trainer.findOne({ username });
    if (!trainer) {
        throw new Error("Aucun dresseur trouvé.");
    }
    return trainer;
};

const updateTrainer = async (username, updates) => {
    const trainer = await Trainer.findOne({ username });
    if (!trainer) {
        throw new Error("Aucun dresseur trouvé.");
    }

    Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
            trainer[key] = updates[key];
        }
    });

    await trainer.save();
    return trainer;
};

const deleteTrainer = async (username) => {
    const deletedTrainer = await Trainer.findOneAndDelete({ username });
    if (!deletedTrainer) {
        throw new Error("Aucun dresseur trouvé.");
    }
};

const markPokemon = async (username, pkmnID, isCaptured) => {
    const trainer = await Trainer.findOne({ username });
    if (!trainer) throw new Error("Dresseur non trouvé.");

    if (isCaptured) {
        if (!trainer.pkmnCatch.includes(pkmnID)) {
            trainer.pkmnCatch.push(pkmnID);
        }
        if (!trainer.pkmnSeen.includes(pkmnID)) {
            trainer.pkmnSeen.push(pkmnID);
        }
    } else {
        if (!trainer.pkmnSeen.includes(pkmnID)) {
            trainer.pkmnSeen.push(pkmnID);
        }
    }

    await trainer.save();
    return trainer;
};

module.exports = { createTrainer, getTrainer, updateTrainer, deleteTrainer, markPokemon };
