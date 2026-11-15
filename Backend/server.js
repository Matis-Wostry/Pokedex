require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const { startAccountPurge } = require("./src/services/accountPurgeService");

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("✅ Connecté à MongoDB");
    // Suppression des comptes inactifs : au démarrage, puis une fois par jour.
    startAccountPurge();
})
.catch((err) => console.error("❌ Erreur de connexion à MongoDB :", err));

console.log("📖 Swagger Docs disponible sur http://localhost:3000/api-docs");

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
