const { spawn } = require("child_process");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const { attendre } = require("./helpers");

describe("Démarrage du serveur", () => {
    let serveur;

    afterEach(() => serveur?.kill());

    it("supprime les comptes inactifs dès le démarrage", async () => {
        await User.collection.insertOne({
            username: "parti",
            password: "x",
            role: "USER",
            lastLoginAt: new Date("2020-01-01T00:00:00Z"),
        });
        const { host, port, name } = mongoose.connection;

        // Le vrai server.js, branché sur la base des tests, sur un port libre.
        serveur = spawn(process.execPath, ["server.js"], {
            cwd: path.join(__dirname, "..", ".."),
            env: { ...process.env, PORT: "0", MONGO_URI: `mongodb://${host}:${port}/${name}` },
            stdio: "ignore",
        });

        await attendre(async () => (await User.countDocuments({ username: "parti" })) === 0);
    });
});
