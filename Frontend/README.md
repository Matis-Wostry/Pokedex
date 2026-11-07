# Frontend — Pokédex React

Interface web du Pokédex, construite avec React + Vite en vibe-coding avec [Claude Code](https://claude.ai/claude-code) (Anthropic).

---

## Prérequis

- Node.js **20.19+** ou **22.12+** (requis par Vite 8)
- Le backend démarré sur `http://localhost:3000`

---

## Installation

```bash
cd Frontend
npm install
```

---

## Lancement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

L'URL de l'API est configurée via la variable d'environnement `VITE_API_URL` (défaut: `http://localhost:3000`).

Pour le build de production, créer un fichier `.env.production` :

```env
VITE_API_URL=https://ton-domaine.com
```

```bash
npm run build
```

---

## Fonctionnalités

### Pokédex

- Liste des 1025 Pokémon avec scroll infini
- Recherche par nom (temps réel)
- Filtrage par type (18 types)
- Filtrage par génération (I à IX)
- Affichage du nombre de résultats

### Mode capture (si profil dresseur créé)

Chaque Pokémon a un statut qui évolue au fil de la progression :

| Statut | Affichage |
|--------|-----------|
| Non vu | Silhouette noire, nom masqué (`???`) |
| Vu | Sprite visible, nom et description débloqués |
| Capturé | Toutes les informations débloquées |

### Mini-jeu de capture

Sur la page de détail d'un Pokémon non capturé, un mini-jeu de timing est proposé :

- Une Pokéball se déplace aléatoirement sur une barre (vitesse et direction variables)
- Une zone verte apparaît à un emplacement et d'une taille aléatoires
- Cliquer sur **Stop !** immobilise la Pokéball
- Si elle s'arrête dans la zone verte : le Pokémon est capturé
- Sinon : il est marqué comme vu

### Profil dresseur

- Créer et modifier son profil (nom + URL d'avatar)
- Barres de progression : Pokémon vus / capturés sur 1025
- Date de création du profil

### Authentification

- Inscription / connexion avec JWT
- Token stocké en localStorage
- Routes protégées (redirection automatique si non connecté)

---

## Structure

```
Frontend/
├── public/
│   └── pokeball.svg
├── src/
│   ├── api/
│   │   ├── auth.js           # login, register
│   │   ├── pokemon.js        # searchPokemon, getPokemon, getTypes
│   │   └── trainer.js        # getTrainer, createTrainer, updateTrainer, markPokemon
│   ├── context/
│   │   └── AuthContext.jsx   # Token JWT global (login, logout)
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Pokedex.jsx       # Liste + filtres + scroll infini
│   │   ├── PokemonDetail.jsx # Détail + mini-jeu de capture
│   │   └── Profile.jsx       # Profil dresseur + progression
│   ├── App.jsx               # Routing React Router
│   └── index.css             # Styles globaux
├── .env.production           # URL API en production
├── vite.config.js
└── package.json
```

---

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19 | UI |
| Vite | 8 | Bundler / dev server |
| React Router | 7 | Navigation |
| CSS natif | — | Styles (dark theme) |
