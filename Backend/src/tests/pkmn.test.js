const request = require("supertest");
const app = require("../../app");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "test_secret";

// Pokémon de test complet
const bulbasaur = {
    name: "Bulbizarre",
    nationalDexId: 1,
    types: ["GRASS", "POISON"],
    regions: [{ regionName: "Kanto", regionPokedexNumber: 1 }],
    hp: 45, attack: 49, defense: 49,
    specialAttack: 65, specialDefense: 65, speed: 45,
    description: "Un étrange Pokémon à la graine.",
    image: "https://example.com/bulbasaur.png",
    weight: 69, height: 7,
    moves: ["Charge", "Rugissement"],
    abilities: ["Engrais"],
    cri: "https://example.com/bulbasaur.mp3"
};

// Helper : créer un token admin
const makeAdminToken = async () => {
    const admin = new User({ username: "adminPkmn", password: "admin123", role: "ADMIN" });
    await admin.save();
    return jwt.sign(
        { userId: admin._id, username: admin.username, role: admin.role },
        SECRET_KEY
    );
};

// Helper : créer un token user normal
const makeUserToken = async () => {
    const user = new User({ username: "userPkmn", password: "user123", role: "USER" });
    await user.save();
    return jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        SECRET_KEY
    );
};

describe("Pokemon — GET /api/pkmn/types", () => {
    it("retourne la liste des 18 types", async () => {
        const res = await request(app).get("/api/pkmn/types");

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(18);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe("Pokemon — POST /api/pkmn/create", () => {
    it("crée un Pokémon (admin)", async () => {
        const token = await makeAdminToken();
        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${token}`)
            .send(bulbasaur);

        expect(res.status).toBe(201);
        expect(res.body.pokemon.name).toBe("Bulbizarre");
    });

    it("refuse un doublon", async () => {
        const token = await makeAdminToken();
        await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${token}`)
            .send(bulbasaur);

        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${token}`)
            .send(bulbasaur);

        expect(res.status).toBe(400);
    });

    it("refuse un user non-admin", async () => {
        const token = await makeUserToken();
        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${token}`)
            .send(bulbasaur);

        expect(res.status).toBe(403);
    });

    it("refuse sans token", async () => {
        const res = await request(app)
            .post("/api/pkmn/create")
            .send(bulbasaur);

        expect(res.status).toBe(401);
    });
});

describe("Pokemon — GET /api/pkmn", () => {
    let pkmnId, userToken;

    beforeEach(async () => {
        const adminToken = await makeAdminToken();
        userToken = await makeUserToken();
        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(bulbasaur);
        pkmnId = res.body.pokemon._id;
    });

    it("trouve un Pokémon par nom", async () => {
        const res = await request(app)
            .get("/api/pkmn?name=Bulbizarre")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("bulbizarre");
    });

    it("trouve un Pokémon par id", async () => {
        const res = await request(app)
            .get(`/api/pkmn?id=${pkmnId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(pkmnId);
    });

    it("retourne 404 si le Pokémon n'existe pas", async () => {
        const res = await request(app)
            .get("/api/pkmn?name=Inexistant")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(404);
    });

    it("refuse sans token", async () => {
        const res = await request(app).get("/api/pkmn?name=Bulbizarre");

        expect(res.status).toBe(401);
    });
});

describe("Pokemon — GET /api/pkmn/search", () => {
    let userToken;

    beforeEach(async () => {
        const adminToken = await makeAdminToken();
        userToken = await makeUserToken();

        await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(bulbasaur);

        await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ ...bulbasaur, name: "Salamèche", nationalDexId: 4, types: ["FIRE"] });
    });

    it("recherche par nom partiel", async () => {
        const res = await request(app)
            .get("/api/pkmn/search?partialName=bulb")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
    });

    it("recherche par type", async () => {
        const res = await request(app)
            .get("/api/pkmn/search?typeOne=FIRE")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
    });

    it("retourne tous les Pokémon sans filtre", async () => {
        const res = await request(app)
            .get("/api/pkmn/search")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(2);
    });

    it("refuse sans token", async () => {
        const res = await request(app).get("/api/pkmn/search");

        expect(res.status).toBe(401);
    });
});

describe("Pokemon — PUT /api/pkmn", () => {
    let pkmnId, adminToken;

    beforeEach(async () => {
        adminToken = await makeAdminToken();
        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(bulbasaur);
        pkmnId = res.body.pokemon._id;
    });

    it("met à jour un Pokémon (admin)", async () => {
        const res = await request(app)
            .put("/api/pkmn")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ id: pkmnId, hp: 99 });

        expect(res.status).toBe(200);
        expect(res.body.pokemon.hp).toBe(99);
    });

    it("refuse un user non-admin", async () => {
        const token = await makeUserToken();
        const res = await request(app)
            .put("/api/pkmn")
            .set("Authorization", `Bearer ${token}`)
            .send({ id: pkmnId, hp: 99 });

        expect(res.status).toBe(403);
    });
});

describe("Pokemon — DELETE /api/pkmn", () => {
    let pkmnId, adminToken;

    beforeEach(async () => {
        adminToken = await makeAdminToken();
        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(bulbasaur);
        pkmnId = res.body.pokemon._id;
    });

    it("supprime un Pokémon (admin)", async () => {
        const res = await request(app)
            .delete(`/api/pkmn?id=${pkmnId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
    });

    it("refuse un user non-admin", async () => {
        const token = await makeUserToken();
        const res = await request(app)
            .delete(`/api/pkmn?id=${pkmnId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});

describe("Pokemon — Gestion des régions", () => {
    let pkmnId, adminToken;

    beforeEach(async () => {
        adminToken = await makeAdminToken();
        const res = await request(app)
            .post("/api/pkmn/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ ...bulbasaur, regions: [] });
        pkmnId = res.body.pokemon._id;
    });

    it("ajoute une région à un Pokémon", async () => {
        const res = await request(app)
            .post("/api/pkmn/region")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ pkmnID: pkmnId, regionName: "Kanto", regionPokedexNumber: 1 });

        expect(res.status).toBe(200);
        expect(res.body.pokemon.regions).toHaveLength(1);
    });

    it("supprime une région d'un Pokémon", async () => {
        await request(app)
            .post("/api/pkmn/region")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ pkmnID: pkmnId, regionName: "Kanto", regionPokedexNumber: 1 });

        const res = await request(app)
            .delete(`/api/pkmn/region?pkmnID=${pkmnId}&regionName=Kanto`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.pokemon.regions).toHaveLength(0);
    });
});
