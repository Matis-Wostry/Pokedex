# Pokédex — Frontend React

Interface web du Pokédex, construite avec React + Vite. Elle se connecte au backend Express/MongoDB pour afficher et filtrer les Pokémon.

> Ce frontend a été réalisé en **vibe-coding** avec Claude Code (IA d'Anthropic), dans le but de tester les capacités de l'outil sur un projet concret.

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

Crée un fichier `.env` si tu veux surcharger l'URL de l'API :

```env
VITE_API_URL=http://localhost:3000
```

---

## Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

---

## Fonctionnalités

- Authentification (inscription / connexion) avec JWT
- Liste paginée des Pokémon avec images
- Recherche par nom
- Filtrage par type (18 types)
- Filtrage par génération (I à IX)
- Page de détail : stats, talents, attaques, cri

---

## Structure

```
src/
├── api/
│   ├── auth.js          # Appels login/register
│   └── pokemon.js       # Appels recherche et détail
├── context/
│   └── AuthContext.jsx  # Gestion du token JWT global
├── components/
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Pokedex.jsx      # Liste + filtres
│   └── PokemonDetail.jsx
├── App.jsx              # Routing
└── index.css            # Styles globaux
```

---

## Stack technique

| Outil | Rôle |
|---|---|
| React 19 | UI |
| Vite 8 | Bundler / dev server |
| React Router 7 | Navigation |
| CSS natif | Styles |
