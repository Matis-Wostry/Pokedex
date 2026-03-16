require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ Connecté à MongoDB"))
.catch((err) => console.error("❌ Erreur de connexion à MongoDB :", err));

console.log("📖 Swagger Docs disponible sur http://localhost:3000/api-docs");

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
