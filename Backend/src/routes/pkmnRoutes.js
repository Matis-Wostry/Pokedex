/**
 * @swagger
 * tags:
 *   name: Pokemon
 *   description: Gestion des Pokémon
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
 *         description: Recherche par nom partiel
 *         schema:
 *           type: string
 *       - name: typeOne
 *         in: query
 *         description: Type 1 du Pokémon
 *         schema:
 *           type: string
 *       - name: typeTwo
 *         in: query
 *         description: Type 2 du Pokémon
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page pour la pagination
 *         schema:
 *           type: integer
 *       - name: size
 *         in: query
 *         description: Nombre d'éléments par page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des Pokémon trouvés
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
 *         description: ID du Pokémon
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         description: Nom du Pokémon
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retourne un Pokémon
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
 *     summary: Ajouter un nouveau Pokémon
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
 *     summary: Supprimer un Pokémon
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
 *     summary: Modifier un Pokémon existant
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