# Pokédex — Fullstack

Projet Pokédex fullstack composé d'une API REST Express/MongoDB et d'une interface web React.

---

## Contexte

**Backend** — Réalisé dans le cadre d'un **projet scolaire**. L'objectif était de concevoir une API REST complète avec authentification JWT, gestion des rôles, documentation Swagger et tests unitaires.

**Frontend** — Développé en **vibe-coding** avec [Claude Code](https://claude.ai/claude-code) (IA d'Anthropic), afin d'explorer et tester les capacités de l'outil sur un projet réel. Le frontend n'existait pas à l'origine ; il a été entièrement généré et itéré en conversation avec l'IA à partir du backend existant.

---

## Architecture

```
Pokedex-git/
├── Backend/   # API Express + MongoDB (projet scolaire)
└── Frontend/  # Interface React + Vite (vibe-coding IA)
```

---

## Lancement rapide

### 1. Backend

```bash
cd Backend
npm install
```

Crée un fichier `Backend/.env` :

```env
PORT=3000
SECRET_KEY=ta_clé_secrète
MONGO_URI=mongodb://localhost:27017/pokedex
```

```bash
npm run dev
```

> API disponible sur `http://localhost:3000`
> Documentation Swagger : `http://localhost:3000/api-docs`

### 2. Peupler la base de données

Crée un compte via Swagger ou le frontend, connecte-toi pour obtenir un token JWT, place-le dans `Backend/fetchPokemon.js` ligne 2, puis :

```bash
cd Backend
node fetchPokemon.js
```

Le script importe les 1025 Pokémon depuis [PokeAPI](https://pokeapi.co/) (~3-4 minutes).

### 3. Frontend

> Requiert Node.js 20.19+ ou 22.12+

```bash
cd Frontend
npm install
npm run dev
```

> Interface disponible sur `http://localhost:5173`

---

## Fonctionnalités

- Authentification JWT (inscription / connexion / rôles)
- CRUD Pokémon (admin)
- Recherche et filtrage par nom, type, génération
- Page de détail avec stats, talents, attaques et cri
- Documentation Swagger complète
- Tests unitaires (Jest)

---

## Stack

| Couche | Technologie |
|---|---|
| API | Node.js, Express |
| Base de données | MongoDB, Mongoose |
| Auth | JWT |
| Docs | Swagger / OpenAPI |
| Tests | Jest |
| Frontend | React 19, Vite 8, React Router 7 |
