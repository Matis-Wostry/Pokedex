const User = require("../models/User");
const Trainer = require("../models/Trainers");
const { purgeInactiveAccounts, startAccountPurge } = require("../services/accountPurgeService");
const { visiteur, attendre } = require("./helpers");

const JOUR_MS = 24 * 60 * 60 * 1000;
const le = (jour) => new Date(`${jour}T12:00:00Z`);

// Le 1er mars 2026 : le 29 janvier est à 31 jours, le 31 janvier à 29 jours.
const MAINTENANT = le("2026-03-01");
const IL_Y_A_31_JOURS = le("2026-01-29");
const IL_Y_A_29_JOURS = le("2026-01-31");

const creerCompte = (username, lastLoginAt, role = "USER") =>
    User.create({ username, password: "motdepasse", role, lastLoginAt });

const existe = async (username) => (await User.countDocuments({ username })) === 1;

describe("Purge des comptes inactifs", () => {
    it("supprime un compte resté 31 jours sans connexion", async () => {
        await creerCompte("parti", IL_Y_A_31_JOURS);

        await purgeInactiveAccounts(MAINTENANT);

        expect(await existe("parti")).toBe(false);
    });

    it("garde un compte connecté il y a 29 jours", async () => {
        await creerCompte("recent", IL_Y_A_29_JOURS);

        await purgeInactiveAccounts(MAINTENANT);

        expect(await existe("recent")).toBe(true);
    });

    it("supprime le profil de dresseur du compte purgé, pas celui des autres", async () => {
        await creerCompte("parti", IL_Y_A_31_JOURS);
        await creerCompte("recent", IL_Y_A_29_JOURS);
        await Trainer.create({ username: "parti", trainerName: "Parti" });
        await Trainer.create({ username: "recent", trainerName: "Récent" });

        await purgeInactiveAccounts(MAINTENANT);

        const restants = await Trainer.find().distinct("username");
        expect(restants).toEqual(["recent"]);
    });

    it("ne supprime jamais un compte ADMIN", async () => {
        await creerCompte("admin", IL_Y_A_31_JOURS, "ADMIN");

        await purgeInactiveAccounts(MAINTENANT);

        expect(await existe("admin")).toBe(true);
    });

    it("renvoie le nombre de comptes supprimés", async () => {
        await creerCompte("parti1", IL_Y_A_31_JOURS);
        await creerCompte("parti2", IL_Y_A_31_JOURS);
        await creerCompte("recent", IL_Y_A_29_JOURS);

        expect(await purgeInactiveAccounts(MAINTENANT)).toBe(2);
    });

    it("laisse 30 jours à un compte créé avant la règle, puis le supprime", async () => {
        // Compte d'avant : aucune date de dernière connexion en base.
        await User.collection.insertOne({ username: "ancien", password: "x", role: "USER" });

        await purgeInactiveAccounts(MAINTENANT);
        expect(await existe("ancien")).toBe(true);

        await purgeInactiveAccounts(new Date(MAINTENANT.getTime() + 29 * JOUR_MS));
        expect(await existe("ancien")).toBe(true);

        await purgeInactiveAccounts(new Date(MAINTENANT.getTime() + 31 * JOUR_MS));
        expect(await existe("ancien")).toBe(false);
    });

    it("supprime au bout de 31 jours un compte inscrit et jamais reconnecté", async () => {
        await visiteur().post("/api/auth/register").send({ username: "curieux", password: "pikachu123" });

        await purgeInactiveAccounts(new Date(Date.now() + 31 * JOUR_MS));

        expect(await existe("curieux")).toBe(false);
    });
});

describe("Purge planifiée", () => {
    let minuteur;

    afterEach(() => clearInterval(minuteur));

    it("purge dès le lancement", async () => {
        await creerCompte("parti", le("2020-01-01"));

        minuteur = startAccountPurge({ intervalMs: 60000 });

        await attendre(async () => !(await existe("parti")), { delaiMs: 3000 });
    });

    it("repasse à chaque intervalle", async () => {
        minuteur = startAccountPurge({ intervalMs: 300 });
        // Le premier passage (base vide) est terminé bien avant 100 ms.
        await new Promise((resolve) => setTimeout(resolve, 100));
        await creerCompte("parti", le("2020-01-01"));

        await attendre(async () => !(await existe("parti")), { delaiMs: 3000 });
    });
});
