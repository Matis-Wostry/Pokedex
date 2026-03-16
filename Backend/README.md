# Pokédex API

API REST backend pour une application Pokédex complète. Permet de gérer les Pokémon, les comptes utilisateurs et les profils de Dresseurs (Pokémon vus et capturés).

## Stack technique

- **Runtime** : Node.js
- **Framework** : Express 4
- **Base de données** : MongoDB + Mongoose
- **Authentification** : JWT (JSON Web Tokens) + bcrypt
- **Documentation** : Swagger UI (`/api-docs`)
- **Tests** : Jest + Supertest + mongodb-memory-server

## Prérequis

- Node.js 18+
- MongoDB local ou une URI MongoDB Atlas

## Installation

```bash
npm install
```

Créer un fichier `.env` à la racine du dossier `Backend/` :

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/pokedex
SECRET_KEY=votre_clé_secrète_jwt
```

## Lancer le serveur

```bash
# Développement (hot-reload)
npm run dev

# Production
node server.js
```

## Lancer les tests

```bash
npm test
```

Les tests utilisent une base MongoDB en mémoire — aucune configuration supplémentaire n'est nécessaire.

## Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible sur :

```
http://localhost:3000/api-docs
```

---

## Endpoints

### Auth — `/api/auth`

| Méthode | Route | Description | Auth requise |
|---------|-------|-------------|:---:|
| POST | `/register` | Créer un compte utilisateur | Non |
| POST | `/login` | Se connecter et obtenir un token JWT | Non |
| GET | `/checkUser` | Vérifier l'utilisateur connecté | Oui |

**Exemple — inscription :**
```json
POST /api/auth/register
{
  "username": "ash",
  "password": "pikachu123"
}
```

**Exemple — connexion :**
```json
POST /api/auth/login
{
  "username": "ash",
  "password": "pikachu123"
}
// Réponse : { "token": "eyJhbGci..." }
```

---

### Pokémon — `/api/pkmn`

Les routes en lecture nécessitent un token. Les routes de modification nécessitent le rôle **ADMIN**.

| Méthode | Route | Description | Auth | Rôle |
|---------|-------|-------------|:----:|:----:|
| GET | `/types` | Liste des 18 types | Non | — |
| GET | `/search` | Recherche avec filtres et pagination | Oui | USER |
| GET | `/` | Détail d'un Pokémon par ID ou nom | Oui | USER |
| POST | `/create` | Créer un Pokémon | Oui | ADMIN |
| PUT | `/` | Modifier un Pokémon | Oui | ADMIN |
| DELETE | `/` | Supprimer un Pokémon | Oui | ADMIN |
| POST | `/region` | Ajouter une région à un Pokémon | Oui | ADMIN |
| DELETE | `/region` | Supprimer une région d'un Pokémon | Oui | ADMIN |

**Paramètres de recherche (`/search`) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `partialName` | string | Recherche par nom partiel (insensible à la casse) |
| `typeOne` | string | Filtrer par type (ex: `FIRE`) |
| `typeTwo` | string | Filtrer par second type |
| `page` | integer | Numéro de page (défaut: 1) |
| `size` | integer | Résultats par page (défaut: 10) |

**Exemple — créer un Pokémon :**
```json
POST /api/pkmn/create
Authorization: Bearer <token>
{
  "name": "Pikachu",
  "nationalDexId": 25,
  "types": ["ELECTRIC"],
  "regions": [{ "regionName": "Kanto", "regionPokedexNumber": 25 }],
  "hp": 35, "attack": 55, "defense": 40,
  "specialAttack": 50, "specialDefense": 50, "speed": 90,
  "description": "Pikachu stocke l'électricité dans ses joues.",
  "image": "https://example.com/pikachu.png",
  "weight": 60, "height": 4,
  "moves": ["tonnerre", "vive-attaque"],
  "abilities": ["statik"],
  "cri": "https://example.com/pikachu.mp3"
}
```

---

### Dresseur — `/api/trainer`

Toutes les routes nécessitent un token. Chaque utilisateur ne peut avoir qu'un seul dresseur.

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer son profil dresseur |
| GET | `/` | Récupérer son profil dresseur |
| PUT | `/` | Modifier son profil dresseur |
| DELETE | `/` | Supprimer son profil dresseur |
| POST | `/mark` | Marquer un Pokémon comme vu ou capturé |

**Exemple — marquer un Pokémon capturé :**
```json
POST /api/trainer/mark
Authorization: Bearer <token>
{
  "pkmnID": "65e0c265f52ffe0b2a171b5a",
  "isCaptured": true
}
```
> Un Pokémon capturé est automatiquement aussi marqué comme vu.

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
| `name` | String | Unique, requis |
| `nationalDexId` | Number | Numéro du Pokédex national |
| `types` | [String] | Ex: `["FIRE", "FLYING"]` |
| `regions` | [Object] | `{ regionName, regionPokedexNumber }` |
| `hp`, `attack`, `defense`, `specialAttack`, `specialDefense`, `speed` | Number | Statistiques de base |
| `description` | String | Description en français |
| `image` | String | URL de l'image officielle |
| `weight`, `height` | Number | Poids (hg) et taille (dm) |
| `moves` | [String] | Liste des attaques |
| `abilities` | [String] | Liste des talents |
| `cri` | String | URL du fichier audio |

### Trainer
| Champ | Type | Description |
|-------|------|-------------|
| `username` | String | Lié au compte User |
| `trainerName` | String | Nom du dresseur |
| `imgUrl` | String | URL de l'image du dresseur |
| `pkmnSeen` | [ObjectId] | Pokémon vus |
| `pkmnCatch` | [ObjectId] | Pokémon capturés |
| `creationDate` | Date | Date de création |

---

## Seeder — Importer les 1025 Pokémon

Un script permet d'importer tous les Pokémon depuis l'API officielle [PokéAPI](https://pokeapi.co) avec les noms et descriptions en français.

> ⚠️ Un compte ADMIN doit exister avant de lancer le script.

```bash
node fetchPokemon.js
```

Le script :
- Récupère les 1025 Pokémon de la PokéAPI
- Traduit les noms et descriptions en français
- Associe chaque Pokémon à ses régions (Kanto, Johto, Hoenn, etc.)
- Insère les données via l'API (requiert un token ADMIN dans le script)

---

## Structure du projet

```
Backend/
├── app.js                  # Config Express (sans listen)
├── server.js               # Point d'entrée — connexion MongoDB + listen
├── fetchPokemon.js         # Script de seed PokéAPI
├── package.json
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
    │   ├── pkmnRoutes.js
    │   ├── authRoutes.js
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
