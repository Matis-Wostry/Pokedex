const request = require("supertest");
const app = require("../../app");

let compteur = 0;

// Chaque appel renvoie un « visiteur » avec sa propre adresse IP (en-tête
// CF-Connecting-IP, celui que lit la limite de requêtes). Sans ça, tous les
// tests d'un fichier partagent la limite de 10 requêtes d'authentification
// par visiteur et finissent en 429.
function visiteur() {
    compteur += 1;
    return request.agent(app).set("CF-Connecting-IP", `203.0.113.${compteur}`);
}

// Attend qu'une condition devienne vraie (pour ce qui se passe en arrière-plan).
async function attendre(condition, { delaiMs = 10000, pasMs = 100 } = {}) {
    const fin = Date.now() + delaiMs;
    while (Date.now() < fin) {
        if (await condition()) return;
        await new Promise((resolve) => setTimeout(resolve, pasMs));
    }
    throw new Error("La condition attendue n'est jamais devenue vraie");
}

module.exports = { visiteur, attendre };
