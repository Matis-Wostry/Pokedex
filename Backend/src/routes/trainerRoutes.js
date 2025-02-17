/**
 * @swagger
 * tags:
 *   name: Trainers
 *   description: Gestion des dresseurs
 */

const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const trainerController = require("../controllers/trainerController");

/**
 * @swagger
 * /api/trainer:
 *   post:
 *     summary: Créer un dresseur
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerName:
 *                 type: string
 *                 example: "Sacha"
 *               imgUrl:
 *                 type: string
 *                 example: "/medias/trainers/sacha.png"
 *     responses:
 *       201:
 *         description: Dresseur créé avec succès
 *       400:
 *         description: Un dresseur existe déjà pour cet utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authenticate, trainerController.createTrainer);

/**
 * @swagger
 * /api/trainer:
 *   get:
 *     summary: Récupérer les informations du dresseur connecté
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retourne les informations du dresseur
 *       404:
 *         description: Aucun dresseur trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authenticate, trainerController.getTrainer);

/**
 * @swagger
 * /api/trainer:
 *   put:
 *     summary: Mettre à jour le dresseur connecté
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerName:
 *                 type: string
 *                 example: "Sacha Kalos"
 *               imgUrl:
 *                 type: string
 *                 example: "/medias/trainers/sacha-kalos.png"
 *     responses:
 *       200:
 *         description: Dresseur mis à jour avec succès
 *       404:
 *         description: Aucun dresseur trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/", authenticate, trainerController.updateTrainer);

/**
 * @swagger
 * /api/trainer:
 *   delete:
 *     summary: Supprimer le dresseur connecté
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Dresseur supprimé avec succès
 *       404:
 *         description: Aucun dresseur trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/", authenticate, trainerController.deleteTrainer);

/**
 * @swagger
 * /api/trainer/mark:
 *   post:
 *     summary: Marquer un Pokémon comme vu ou capturé
 *     tags: [Trainers]
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
 *               isCaptured:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Pokémon vu ou capturé avec succès
 *       404:
 *         description: Pokémon ou Dresseur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post("/mark", authenticate, trainerController.markPokemon);

module.exports = router;
