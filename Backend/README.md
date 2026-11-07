# Backend — API Pokédex

API REST complète pour l'application Pokédex, développée dans le cadre d'un projet scolaire.

---

## Stack

| Technologie | Rôle |
|-------------|------|
| Node.js + Express | Serveur HTTP |
| MongoDB + Mongoose | Base de données |
| JWT + bcrypt | Authentification |
| Swagger / OpenAPI | Documentation interactive |
| Jest + Supertest | Tests unitaires |
| express-rate-limit | Protection contre les abus |
| Docker | Conteneurisation |

---

## Fonctionnalités

- Authentification complète (inscription, connexion, JWT)
- Gestion des rôles (USER / ADMIN)
- CRUD Pokémon (modification réservée aux ADMIN)
- Recherche par nom (partielle), filtre par type, filtre par génération (I à IX)
- Profil dresseur : création, mise à jour, suivi des Pokémon vus et capturés
- Rate limiting : 100 req/15 min par IP (global), 10 req/15 min sur les routes d'auth
- Documentation Swagger interactive

---

## Structure

```
Backend/
├── app.js                  # Config Express (sans listen)
├── server.js               # Point d'entrée — connexion MongoDB + listen
├── fetchPokemon.js         # Script d'import depuis PokéAPI
├── updateFrenchNames.js    # Script de mise à jour des noms français
├── Dockerfile
└── src/
    ├── controllers/        # Handlers HTTP
    │   ├── authController.js
    │   ├── pkmnController.js
    │   └── trainerController.js
    ├── middlewares/        # Auth JWT + contrôle des rôles
    │   ├── authMiddleware.js
    │   └── permissionMiddleware.js
    ├── models/             # Schémas Mongoose
    │   ├── Pokemon.js
    │   ├── User.js
    │   ├── Trainers.js
    │   └── PkmnType.js
    ├── routes/             # Définition des routes + docs Swagger
    │   ├── authRoutes.js
    │   ├── pkmnRoutes.js
    │   └── trainerRoutes.js
    ├── services/           # Logique métier
    │   ├── pkmnService.js
    │   └── trainerService.js
    └── tests/              # Suite de tests Jest
        ├── setup.js
        ├── auth.test.js
        ├── pkmn.test.js
        └── trainer.test.js
```

---

## Lancement local

### Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)

### Installation

```bash
cd Backend
npm install
```

Créer le fichier `.env` :

```env
PORT=3000
SECRET_KEY=ta_clé_secrète
MONGO_URI=mongodb://localhost:27017/pokedex
```

```bash
npm run dev
```

- API : `http://localhost:3000`
- Swagger : `http://localhost:3000/api-docs`

---

## Routes

### Auth — `/api/auth`

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/register` | Inscription | Non |
| POST | `/login` | Connexion → retourne un JWT | Non |
| GET | `/checkUser` | Vérifier l'utilisateur connecté | Oui |

### Pokémon — `/api/pkmn`

| Méthode | Route | Description | Auth | Rôle |
|---------|-------|-------------|------|------|
| GET | `/types` | Liste des types disponibles | Non | — |
| GET | `/search` | Recherche avec filtres et pagination | Oui | USER |
| GET | `/:id` | Détail d'un Pokémon | Oui | USER |
| POST | `/create` | Créer un Pokémon | Oui | ADMIN |
| PUT | `/` | Modifier un Pokémon | Oui | ADMIN |
| DELETE | `/` | Supprimer un Pokémon | Oui | ADMIN |

**Paramètres de recherche (`GET /search`) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `partialName` | string | Recherche par nom partiel (insensible à la casse) |
| `typeOne` | string | Filtre par type (ex: `fire`) |
| `generation` | integer | Filtre par génération (`1` à `9`) |
| `page` | integer | Numéro de page (défaut: 1) |
| `size` | integer | Résultats par page (défaut: 20) |

### Dresseur — `/api/trainer`

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer son profil dresseur |
| GET | `/` | Récupérer son profil dresseur |
| PUT | `/` | Modifier son profil dresseur |
| DELETE | `/` | Supprimer son profil dresseur |
| POST | `/mark` | Marquer un Pokémon comme vu ou capturé |

---

## Modèles de données

### User
| Champ | Type | Description |
|-------|------|-------------|
| `username` | String | Unique, requis |
| `password` | String | Hashé avec bcrypt |
| `role` | String | `USER` (défaut) ou `ADMIN` |

### Pokemon
| Champ | Type | Description |
|-------|------|-------------|
| `name` | String | Nom en français |
| `nationalDexId` | Number | Numéro du Pokédex national |
| `types` | [String] | Ex: `["fire", "flying"]` |
| `description` | String | Description en français |
| `image` | String | URL du sprite officiel |
| `height`, `weight` | Number | Taille (dm) et poids (hg) |
| `moves` | [String] | Liste des attaques |
| `abilities` | [String] | Liste des talents |
| `cri` | String | URL du fichier audio |
| `stats` | [Object] | `{ stat: { name }, base_stat }` |

### Trainer
| Champ | Type | Description |
|-------|------|-------------|
| `username` | String | Lié au compte User |
| `trainerName` | String | Nom du dresseur |
| `imgUrl` | String | URL de l'avatar |
| `pkmnSeen` | [ObjectId] | Pokémon vus |
| `pkmnCatch` | [ObjectId] | Pokémon capturés |
| `creationDate` | Date | Date de création |

---

## Import des Pokémon

Le script `fetchPokemon.js` importe les 1025 Pokémon depuis [PokéAPI](https://pokeapi.co) avec les noms et descriptions en français.

### Étapes

1. Créer un compte via Swagger (`POST /api/auth/register`)
2. Se connecter (`POST /api/auth/login`) → copier le JWT
3. Passer le compte en ADMIN dans MongoDB :
   ```js
   db.users.updateOne({ username: "ton_username" }, { $set: { role: "ADMIN" } })
   ```
4. Renseigner le token dans `fetchPokemon.js` :
   ```js
   const TOKEN = 'ton_jwt_ici';
   ```
5. Lancer le script :
   ```bash
   node fetchPokemon.js
   ```
   > Durée estimée : ~20 min pour 1025 Pokémon (appels PokéAPI séquentiels pour les traductions françaises)

### Mettre à jour les noms français (si déjà importé en anglais)

```bash
node updateFrenchNames.js
```

---

## Tests

```bash
npm test
```

Tests Jest + Supertest sur une base MongoDB en mémoire — aucune configuration supplémentaire requise.

