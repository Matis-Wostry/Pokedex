require("dotenv").config();
const express = require("express");
const pkmnRoutes = require("./src/routes/pkmnRoutes");
const authRoutes = require("./src/routes/authRoutes");
const trainerRoutes = require("./src/routes/trainerRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8081", "exp://192.168.1.29:8081"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

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
    apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use("/medias", express.static("src/medias"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api/pkmn", pkmnRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trainer", trainerRoutes);

app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API Pokédex !");
});

module.exports = app;
