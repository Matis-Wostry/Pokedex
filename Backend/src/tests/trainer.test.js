const request = require("supertest");
const app = require("../../app");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "test_secret";

const bulbasaur = {
    name: "Bulbizarre",
    nationalDexId: 1,
    types: ["GRASS", "POISON"],
    regions: [],
    hp: 45, attack: 49, defense: 49,
    specialAttack: 65, specialDefense: 65, speed: 45,
    description: "Un étrange Pokémon à la graine.",
    image: "https://example.com/bulbasaur.png",
    weight: 69, height: 7,
    moves: ["Charge"], abilities: ["Engrais"],
    cri: "https://example.com/bulbasaur.mp3"
};

// Helper : crée un user et retourne son token
const createUser = async (username = "ash") => {
    const user = new User({ username, password: "pikachu", role: "USER" });
    await user.save();
    return jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        SECRET_KEY
    );
};

// Helper : crée un admin et retourne son token
const createAdmin = async () => {
    const admin = new User({ username: "adminTrainer", password: "admin", role: "ADMIN" });
    await admin.save();
    return jwt.sign(
        { userId: admin._id, username: admin.username, role: admin.role },
        SECRET_KEY
    );
};

describe("Trainer — POST /api/trainer", () => {
    it("crée un dresseur pour l'utilisateur connecté", async () => {
        const token = await createUser("ash");
        const res = await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Sacha", imgUrl: "https://example.com/ash.png" });

        expect(res.status).toBe(201);
        expect(res.body.trainer.trainerName).toBe("Sacha");
        expect(res.body.trainer.username).toBe("ash");
    });

    it("refuse un deuxième dresseur pour le même utilisateur", async () => {
        const token = await createUser("ash2");
        await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Sacha", imgUrl: "https://example.com/ash.png" });

        const res = await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Sacha2", imgUrl: "https://example.com/ash2.png" });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/déjà associé/);
    });

    it("refuse sans token", async () => {
        const res = await request(app)
            .post("/api/trainer")
            .send({ trainerName: "Sacha" });

        expect(res.status).toBe(401);
    });
});

describe("Trainer — GET /api/trainer", () => {
    it("retourne le dresseur de l'utilisateur connecté", async () => {
        const token = await createUser("misty");
        await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Ondine" });

        const res = await request(app)
            .get("/api/trainer")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.trainerName).toBe("Ondine");
    });

    it("retourne 404 si aucun dresseur n'existe", async () => {
        const token = await createUser("brock");
        const res = await request(app)
            .get("/api/trainer")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

describe("Trainer — PUT /api/trainer", () => {
    it("met à jour le dresseur", async () => {
        const token = await createUser("gary");
        await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Régis" });

        const res = await request(app)
            .put("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Régis Pro" });

        expect(res.status).toBe(200);
        expect(res.body.trainer.trainerName).toBe("Régis Pro");
    });
});

describe("Trainer — DELETE /api/trainer", () => {
    it("supprime le dresseur", async () => {
        const token = await createUser("red");
        await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${token}`)
            .send({ trainerName: "Rouge" });

        const res = await request(app)
            .delete("/api/trainer")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(204);
    });

    it("retourne 404 si le dresseur n'existe pas", async () => {
        const token = await createUser("blue");
        const res = await request(app)
            .delete("/api/trainer")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

describe("Trainer — POST /api/trainer/mark", () => {
    let userToken, adminToken, pkmnId;

    beforeEach(async () => {
        userToken = await createUser("oak");
        adminToken = await createAdmin();

        // Créer un Pokémon
        const pkmnRes = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(bulbasaur);
        pkmnId = pkmnRes.body.pokemon._id;

        // Créer un dresseur
        await request(app)
            .post("/api/trainer")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ trainerName: "Professeur Chen" });
    });

    it("marque un Pokémon comme vu", async () => {
        const res = await request(app)
            .post("/api/trainer/mark")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ pkmnID: pkmnId, isCaptured: false });

        expect(res.status).toBe(200);
        expect(res.body.trainer.pkmnSeen).toHaveLength(1);
        expect(res.body.trainer.pkmnCatch).toHaveLength(0);
    });

    it("marque un Pokémon comme capturé (et vu)", async () => {
        const res = await request(app)
            .post("/api/trainer/mark")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ pkmnID: pkmnId, isCaptured: true });

        expect(res.status).toBe(200);
        expect(res.body.trainer.pkmnSeen).toHaveLength(1);
        expect(res.body.trainer.pkmnCatch).toHaveLength(1);
    });

    it("ne duplique pas un Pokémon déjà vu", async () => {
        await request(app)
            .post("/api/trainer/mark")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ pkmnID: pkmnId, isCaptured: false });

        const res = await request(app)
            .post("/api/trainer/mark")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ pkmnID: pkmnId, isCaptured: false });

        expect(res.status).toBe(200);
        expect(res.body.trainer.pkmnSeen).toHaveLength(1);
    });

    it("retourne 404 pour un Pokémon inexistant", async () => {
        const res = await request(app)
            .post("/api/trainer/mark")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ pkmnID: "000000000000000000000000", isCaptured: false });

        expect(res.status).toBe(404);
    });
});
