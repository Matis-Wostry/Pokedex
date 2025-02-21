/**
 * @swagger
 * tags:
 *   name: Pokemon
 *   description: Gestion des Pokémon avec toutes leurs caractéristiques.
 */
const express = require("express");
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");
const { authenticate } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/permissionMiddleware");

router.get("/types", pkmnController.getTypes);

/**
 * @swagger
 * /api/pkmn/search:
 *   get:
 *     summary: Rechercher des Pokémon avec filtres
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: partialName
 *         in: query
 *         description: Recherche par nom partiel (insensible à la casse)
 *         schema:
 *           type: string
 *       - name: typeOne
 *         in: query
 *         description: Type principal du Pokémon
 *         schema:
 *           type: string
 *       - name: typeTwo
 *         in: query
 *         description: Second type du Pokémon
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Numéro de page pour la pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: size
 *         in: query
 *         description: Nombre d'éléments par page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste paginée des Pokémon trouvés
 *       500:
 *         description: Erreur serveur
 */
router.get("/search", authenticate, pkmnController.searchPokemon);

/**
 * @swagger
 * /api/pkmn:
 *   get:
 *     summary: Récupérer un Pokémon par ID ou nom
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: Identifiant unique du Pokémon
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         description: Nom du Pokémon
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du Pokémon avec statistiques, capacités, etc.
 *       404:
 *         description: Aucun Pokémon trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authenticate, pkmnController.getPokemon);

/**
 * @swagger
 * /api/pkmn/create:
 *   post:
 *     summary: Ajouter un nouveau Pokémon à la base de données
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pikachu"
 *               types:
 *                 type: array
 *                 example: ["ELECTRIC"]
 *               regions:
 *                 type: array
 *                 example: [{ "regionName": "Kanto", "regionPokedexNumber": 25 }]
 *               hp:
 *                 type: integer
 *                 example: 35
 *               attack:
 *                 type: integer
 *                 example: 55
 *               defense:
 *                 type: integer
 *                 example: 40
 *               specialAttack:
 *                 type: integer
 *                 example: 50
 *               specialDefense:
 *                 type: integer
 *                 example: 50
 *               speed:
 *                 type: integer
 *                 example: 90
 *               weight:
 *                 type: integer
 *                 example: 60
 *               height:
 *                 type: integer
 *                 example: 4
 *               moves:
 *                 type: array
 *                 example: ["thunderbolt", "quick-attack"]
 *               abilities:
 *                 type: array
 *                 example: ["static", "lightning-rod"]
 *               cri:
 *                 type: string
 *                 example: "https://play.pokemonshowdown.com/audio/cries/pikachu.mp3"
 *               description:
 *                 type: string
 *                 example: "Pikachu stocke l'électricité dans ses joues."
 *               image:
 *                 type: string
 *                 example: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
 *     responses:
 *       201:
 *         description: Pokémon ajouté avec succès
 *       400:
 *         description: Le Pokémon existe déjà
 *       500:
 *         description: Erreur serveur
 */
router.post("/create", authenticate, authorize("ADMIN"), pkmnController.createPokemon);

/**
 * @swagger
 * /api/pkmn/region:
 *   post:
 *     summary: Ajouter une région à un Pokémon
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pkmnID:
 *                 type: string
 *                 example: "65e0c265f52ffe0b2a171b5a"
 *               regionName:
 *                 type: string
 *                 example: "Kanto"
 *               regionPokedexNumber:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       200:
 *         description: Région ajoutée/modifiée avec succès
 *       404:
 *         description: Pokémon non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post("/region", authenticate, authorize("ADMIN"), pkmnController.addRegionToPokemon);

/**
 * @swagger
 * /api/pkmn:
 *   delete:
 *     summary: Supprimer un Pokémon de la base de données
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: ID du Pokémon à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Pokémon supprimé avec succès
 *       404:
 *         description: Pokémon non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/", authenticate, authorize("ADMIN"), pkmnController.deletePokemon);

/**
 * @swagger
 * /api/pkmn:
 *   put:
 *     summary: Modifier un Pokémon existant dans la base de données
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "65e0c265f52ffe0b2a171b5a"
 *               name:
 *                 type: string
 *                 example: "Super Pikachu"
 *               hp:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       200:
 *         description: Pokémon mis à jour avec succès
 *       404:
 *         description: Pokémon non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/", authenticate, authorize("ADMIN"), pkmnController.updatePokemon);

/**
 * @swagger
 * /api/pkmn/region:
 *   delete:
 *     summary: Supprimer une région d'un Pokémon
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pkmnID
 *         in: query
 *         description: ID du Pokémon
 *         schema:
 *           type: string
 *       - name: regionName
 *         in: query
 *         description: Nom de la région à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Région supprimée avec succès
 *       404:
 *         description: Région ou Pokémon non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/region", authenticate, authorize("ADMIN"), pkmnController.removeRegionFromPokemon);

module.exports = router;
