# 🏆 Pokedex - Backend API

Une API backend permettant la gestion des Pokémon, des dresseurs et des utilisateurs dans un Pokedex interactif.

## 📌 Table des matières
- [📦 Pré-requis](#-pré-requis)
- [⚙️ Installation](#%EF%B8%8F-installation)
- [🚀 Lancement](#-lancement)
- [🔐 Configuration](#-configuration)
- [📁 Structure du projet](#-structure-du-projet)
- [🛠 Endpoints API](#-endpoints-api)
- [📄 Documentation Swagger](#-documentation-swagger)

---

## 📦 Pré-requis

Avant de démarrer le projet, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version recommandée : 16+)
- [MongoDB](https://www.mongodb.com/) (base de données)
- Un gestionnaire de paquets comme **npm** ou **yarn**

---

## ⚙️ Installation

Clonez le projet :

```bash
git clone https://github.com/Matis-Wostry/Pokedex.git
cd Backend
```

Installez les dépendances :

```bash
npm install
```

Créez un fichier .env à la racine du projet et ajoutez :

```
PORT=5000
SECRET_KEY=your_secret_key
MONGO_URI=mongodb://localhost:27017/pokedex
```

## 🚀 Lancement
Démarrez MongoDB (si ce n'est pas déjà fait) :
```bash
mongod
```

Lancez le serveur :
```bash
npm start
```

Le serveur sera accessible à l'adresse : http://localhost:5000

## 📄 Documentation Swagger
L’API est documentée avec Swagger. Une fois le serveur démarré, accédez à :

```bash
http://localhost:5000/api-docs
```

Vous y trouverez une interface interactive pour tester les endpoints.

## 📝 Insertion des données

Avant de pouvoir utiliser les fonctionnalités de l'API, **vous devez créer un utilisateur, vous connecter et récupérer un token JWT**. 
Ce token sera ensuite utilisé dans `fetchPokemon.js` pour interagir avec l'API.

### 🔹 1. Créer un utilisateur

Envoyez une requête **POST** à l'endpoint `/api/auth/register` avec un nom d'utilisateur et un mot de passe.

### 2. Se connecter et récupérer le token

Envoyez une requête POST à /api/auth/login avec les mêmes identifiants.

### 3. Remplacer le token dans fetchPokemon.js

Dans votre fichier fetchPokemon.js (ou l'endroit où vous faites des requêtes API), remplacez le token existant par celui que vous avez copié.

### 4. Lancer le script
``` yaml
cd Backend
node fetchPokemon.js
```

Attendez que toutes les données soient ajoutées, puis effectuez les tests API.

# 📱 Pokenative – Frontend React Native

## 🚀 Installation et Lancement du Frontend

#### Installer les dépendances

``` yaml
cd Frontend/Pokenative
npm init
```

#### Lancer l’application

``` yaml
npx expo start
```

Installez l'application Expo Go sur votre téléphone.  
Assurez-vous d'être connecté au même réseau Wi-Fi que votre ordinateur.  
Scannez le QR code qui est apparu lors du lancement de l'application.  