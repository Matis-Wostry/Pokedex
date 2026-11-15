const { visiteur } = require("./helpers");

// Un visiteur (donc une adresse IP) par test : la limite de 10 requêtes
// d'authentification par visiteur ne se cumule plus d'un test à l'autre.
let api;
beforeEach(() => {
    api = visiteur();
});

describe("Auth — POST /api/auth/register", () => {
    it("crée un utilisateur avec succès", async () => {
        const res = await api
            .post("/api/auth/register")
            .send({ username: "ash", password: "pikachu123" });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Utilisateur créé avec succès !");
    });

    it("refuse un doublon de username", async () => {
        await api
            .post("/api/auth/register")
            .send({ username: "ash", password: "pikachu123" });

        const res = await api
            .post("/api/auth/register")
            .send({ username: "ash", password: "autreMdp" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});

describe("Auth — POST /api/auth/login", () => {
    beforeEach(async () => {
        await api
            .post("/api/auth/register")
            .send({ username: "misty", password: "starmie" });
    });

    it("retourne un token avec des identifiants valides", async () => {
        const res = await api
            .post("/api/auth/login")
            .send({ username: "misty", password: "starmie" });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it("refuse un mauvais mot de passe", async () => {
        const res = await api
            .post("/api/auth/login")
            .send({ username: "misty", password: "mauvais" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Mot de passe incorrect");
    });

    it("refuse un utilisateur inexistant", async () => {
        const res = await api
            .post("/api/auth/login")
            .send({ username: "inconnu", password: "xxx" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Utilisateur non trouvé");
    });
});

describe("Auth — GET /api/auth/checkUser", () => {
    let token;

    beforeEach(async () => {
        await api
            .post("/api/auth/register")
            .send({ username: "brock", password: "onix" });

        const res = await api
            .post("/api/auth/login")
            .send({ username: "brock", password: "onix" });

        token = res.body.token;
    });

    it("retourne l'utilisateur connecté avec un token valide", async () => {
        const res = await api
            .get("/api/auth/checkUser")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user.username).toBe("brock");
    });

    it("refuse sans token", async () => {
        const res = await api.get("/api/auth/checkUser");

        expect(res.status).toBe(401);
    });

    it("refuse avec un token invalide", async () => {
        const res = await api
            .get("/api/auth/checkUser")
            .set("Authorization", "Bearer tokenbidon");

        expect(res.status).toBe(401);
    });
});
