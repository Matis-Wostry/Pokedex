# Pokédex — Fullstack

Application Pokédex fullstack avec système de capture gamifié, profil dresseur et déploiement sur serveur personnel.

---

## Contexte

**Backend** — Réalisé dans le cadre d'un **projet scolaire**. Objectif : concevoir une API REST complète avec authentification JWT, gestion des rôles, documentation Swagger et tests unitaires.

**Frontend** — Développé en **vibe-coding** avec [Claude Code](https://claude.ai/claude-code) (Anthropic), pour explorer et tester les capacités de l'outil sur un projet réel. Entièrement généré et itéré en conversation avec l'IA à partir du backend existant.

**Production** — Hébergé sur un serveur personnel Ubuntu avec Docker et Caddy en reverse proxy. Le déploiement est continu : chaque push sur `main` du dépôt Forgejo déclenche l'autodeploy du serveur, qui reconstruit le backend et le frontend.

---

## Démo

**[pokedex.matis-wostry.com](https://pokedex.matis-wostry.com)**

---

## Fonctionnalités

- Authentification complète (inscription / connexion / JWT)
- 1025 Pokémon importés depuis [PokéAPI](https://pokeapi.co) avec noms et descriptions en français
- Recherche par nom, filtrage par type et par génération (I à IX)
- Scroll infini
- **Mode capture** : chaque Pokémon est grisé jusqu'à ce qu'il soit découvert
  - Mini-jeu de timing pour capturer (barre aléatoire, zone verte aléatoire)
  - Vu → sprite + description visible
  - Capturé → toutes les infos débloquées (stats, talents, attaques, cri)
- Profil dresseur : nom, avatar, barres de progression vu/capturé
- Rate limiting (100 req/15 min par IP, 10 sur l'auth)
- Documentation Swagger interactive

---

## Architecture

```
Pokedex/
├── Backend/          # API Express + MongoDB (projet scolaire)
├── Frontend/         # Interface React + Vite (vibe-coding IA)
└── docker-compose.yml  # backend, base MongoDB, build du frontend
```

## Lancement local

### Backend

```bash
cd Backend
npm install
```

Créer `Backend/.env` :
```env
PORT=3000
SECRET_KEY=ta_clé_secrète
MONGO_URI=mongodb://localhost:27017/pokedex
```

```bash
npm run dev
```

> API : `http://localhost:3000` — Swagger : `http://localhost:3000/api-docs`

### Importer les Pokémon

1. Créer un compte via Swagger (`POST /api/auth/register`)
2. Se connecter (`POST /api/auth/login`) → copier le token
3. Passer le compte en ADMIN dans MongoDB : `db.users.updateOne({username: "..."}, {$set: {role: "ADMIN"}})`
4. Renseigner le token dans `Backend/fetchPokemon.js`
5. Lancer : `node fetchPokemon.js` (~20 min pour 1025 Pokémon en français)

### Frontend

> Node.js 20.19+ ou 22.12+ requis

```bash
cd Frontend
npm install
npm run dev
```

> Interface : `http://localhost:5173`

## Stack

| Couche | Technologie |
|--------|-------------|
| API | Node.js, Express |
| Base de données | MongoDB, Mongoose |
| Auth | JWT + bcrypt |
| Docs | Swagger / OpenAPI |
| Tests | Jest + Supertest |
| Frontend | React 19, Vite, React Router |
| Conteneurs | Docker, Docker Compose |
| CI/CD | Forgejo (webhook) + autodeploy du serveur |
