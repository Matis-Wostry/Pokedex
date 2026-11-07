require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const pkmnRoutes = require("./src/routes/pkmnRoutes");
const authRoutes = require("./src/routes/authRoutes");
const trainerRoutes = require("./src/routes/trainerRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8081", "exp://192.168.1.29:8081", "https://pokedex.matis-wostry.com"],
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
        servers: [
            { url: "https://pokedex.matis-wostry.com", description: "Production" },
            { url: "http://localhost:3000", description: "Local" }
        ],
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

// En production, les requêtes arrivent par Cloudflare puis Caddy. L'API ne
// voit donc jamais l'IP du visiteur directement, seulement celle du proxy.
// Sans ce réglage, tous les visiteurs partageraient la même limite : 10
// connexions ratées, et plus personne ne pourrait se connecter.
app.set("trust proxy", 1);

// La vraie IP du visiteur est dans CF-Connecting-IP (ajouté par Cloudflare) ;
// en local, sans Cloudflare, on retombe sur req.ip.
const clientKey = (req) =>
    rateLimit.ipKeyGenerator(req.headers["cf-connecting-ip"] || req.ip);

// Rate limiting : 1000 requêtes / 15 min par visiteur. 100 était trop bas :
// parcourir tout le Pokédex en scroll infini fait déjà ~55 requêtes, plus les
// fiches, les types et le profil.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: clientKey,
    message: { error: "Trop de requêtes, réessayez dans 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limite stricte sur l'auth : 10 tentatives / 15 min (anti brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: clientKey,
    message: { error: "Trop de tentatives de connexion, réessayez dans 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use("/medias", express.static("src/medias"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/", limiter);
app.use("/api/auth", authLimiter);

app.use("/api/pkmn", pkmnRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trainer", trainerRoutes);

app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API Pokédex !");
});

module.exports = app;
