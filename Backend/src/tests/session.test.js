const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { visiteur } = require("./helpers");

const JOUR = 24 * 60 * 60; // en secondes, l'unité des jetons
const IDENTIFIANTS = { username: "sacha", password: "pikachu123" };
const EN_2020 = new Date("2020-01-01T00:00:00Z");

describe("Session", () => {
    let api;

    beforeEach(async () => {
        api = visiteur();
        await api.post("/api/auth/register").send(IDENTIFIANTS);
    });

    it("enregistre la date de la dernière connexion", async () => {
        await User.updateOne({ username: "sacha" }, { $set: { lastLoginAt: EN_2020 } });
        const avant = Date.now();

        await api.post("/api/auth/login").send(IDENTIFIANTS);

        const user = await User.findOne({ username: "sacha" });
        expect(user.get("lastLoginAt")?.getTime()).toBeGreaterThanOrEqual(avant);
    });

    it("ne compte pas une connexion ratée comme une connexion", async () => {
        await User.updateOne({ username: "sacha" }, { $set: { lastLoginAt: EN_2020 } });

        await api.post("/api/auth/login").send({ username: "sacha", password: "mauvais" });

        const user = await User.findOne({ username: "sacha" });
        expect(user.get("lastLoginAt")).toEqual(EN_2020);
    });

    it("délivre un jeton encore valable 6 jours plus tard, refusé au bout de 8", async () => {
        const { body } = await api.post("/api/auth/login").send(IDENTIFIANTS);
        const { iat } = jwt.decode(body.token);
        const verifierApres = (jours) => () =>
            jwt.verify(body.token, process.env.SECRET_KEY, { clockTimestamp: iat + jours * JOUR });

        expect(verifierApres(6)).not.toThrow();
        expect(verifierApres(8)).toThrow("jwt expired");
    });

    it("refuse un ancien jeton sans date d'expiration émis il y a 8 jours", async () => {
        const iat = Math.floor(Date.now() / 1000) - 8 * JOUR;
        const ancien = jwt.sign({ userId: "x", username: "sacha", role: "USER", iat }, process.env.SECRET_KEY);

        const res = await api.get("/api/auth/checkUser").set("Authorization", `Bearer ${ancien}`);

        expect(res.status).toBe(401);
    });

    it("n'écrit pas le jeton dans les journaux", async () => {
        const { body } = await api.post("/api/auth/login").send(IDENTIFIANTS);
        const journal = jest.spyOn(console, "log").mockImplementation(() => {});

        await api.get("/api/auth/checkUser").set("Authorization", `Bearer ${body.token}`);

        const ecrit = journal.mock.calls.flat().map(String).join("\n");
        journal.mockRestore();
        expect(ecrit).not.toContain(body.token);
    });
});
