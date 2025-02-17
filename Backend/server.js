require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const pkmnRoutes = require("./src/routes/pkmnRoutes");
const authRoutes = require("./src/routes/authRoutes");
const trainerRoutes = require("./src/routes/trainerRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.SECRET_KEY;

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Pokedex API",
            version: "1.0.0",
            description: "API Express pour gérer les dresseurs et les Pokémon",
        },
        servers: [{ url: "http://localhost:3000" }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Entrez le token JWT sous la forme 'Bearer <TOKEN>'",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.js"], // Fichiers où Swagger va chercher les routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

mongoose.connect(MONGO_URI)
.then(() => console.log("✅ Connecté à MongoDB"))
.catch((err) => console.error("❌ Erreur de connexion à MongoDB :", err));

const app = express();

app.use(express.json()); 
app.use("/medias", express.static("src/medias"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log("📖 Swagger Docs disponible sur http://localhost:3000/api-docs");

// Utilisation des routes
app.use("/api/pkmn", pkmnRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trainer", trainerRoutes);

app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API Pokédex !");
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});