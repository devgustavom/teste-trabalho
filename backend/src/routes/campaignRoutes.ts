import { Router } from "express";
import { CampaignController } from "../controllers/CampaignController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Gestão de campanhas promocionais (fornecedor cria suas campanhas, admin pode tudo)
 */

/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Lista todas as campanhas
 *     tags: [Campaigns]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de campanhas
 */
router.use(authenticateJWT);
router.get("/", wrapAsync(CampaignController.list));

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Detalhes de uma campanha (inclui produtos vinculados)
 *     tags: [Campaigns]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Campanha encontrada com produtos
 *       404:
 *         description: Campanha não encontrada
 */
router.get("/:id", wrapAsync(CampaignController.get));

/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Cria uma campanha promocional
 *     tags: [Campaigns]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - title
 *               - min_order_value
 *               - target_type
 *             properties:
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Promoção de Verão"
 *               description:
 *                 type: string
 *               banner_url:
 *                 type: string
 *               target_amount:
 *                 type: number
 *                 example: 50000.00
 *                 description: "Meta geral (obrigatório se target_type='general')"
 *               min_order_value:
 *                 type: number
 *                 example: 500.00
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               target_type:
 *                 type: string
 *                 enum: [general, individual]
 *                 example: "general"
 *                 description: "general = meta geral, individual = cada pedido válido individualmente"
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Campanha criada
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post("/", authorizeRoles("admin", "supplier"), wrapAsync(CampaignController.create));

/**
 * @swagger
 * /campaigns/{id}:
 *   put:
 *     summary: Atualiza uma campanha
 *     tags: [Campaigns]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Campanha atualizada
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Campanha não encontrada
 */
router.put("/:id", authorizeRoles("admin", "supplier"), wrapAsync(CampaignController.update));

/**
 * @swagger
 * /campaigns/{id}:
 *   delete:
 *     summary: Remove uma campanha
 *     tags: [Campaigns]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Campanha removida
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Campanha não encontrada
 */
router.delete("/:id", authorizeRoles("admin", "supplier"), wrapAsync(CampaignController.delete));

/**
 * @swagger
 * /campaigns/{id}/meta:
 *   get:
 *     summary: Verifica se campanha com meta geral atingiu o objetivo
 *     tags: [Campaigns]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Status da meta
 */
router.get("/:id/meta", wrapAsync(CampaignController.checkMeta));

export default router;
