import { Router } from "express";
import { StateConditionController } from "../controllers/StateConditionController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: StateConditions
 *   description: Condições comerciais por estado (UF) - fornecedor define cashback, prazo, ajustes por estado (aplicadas automaticamente nos pedidos)
 */

/**
 * @swagger
 * /state-conditions:
 *   get:
 *     summary: Lista condições regionais (fornecedor vê suas, admin vê todas)
 *     tags: [StateConditions]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de condições regionais
 */
router.use(authenticateJWT);
router.get("/", authorizeRoles("admin", "supplier"), wrapAsync(StateConditionController.list));

/**
 * @swagger
 * /state-conditions/{id}:
 *   get:
 *     summary: Detalhes de uma condição regional
 *     tags: [StateConditions]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Condição encontrada
 *       404:
 *         description: Condição não encontrada
 */
router.get("/:id", authorizeRoles("admin", "supplier"), wrapAsync(StateConditionController.get));

/**
 * @swagger
 * /state-conditions:
 *   post:
 *     summary: Cria uma condição regional (fornecedor ou admin)
 *     tags: [StateConditions]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - state
 *             properties:
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               state:
 *                 type: string
 *                 example: "SP"
 *                 description: "UF (estado)"
 *               cashback_percent:
 *                 type: number
 *                 example: 5.5
 *                 description: "Percentual de cashback (ex: 5.5 = 5.5%)"
 *               payment_term:
 *                 type: integer
 *                 example: 30
 *                 description: "Prazo de pagamento em dias"
 *               unit_adjustment:
 *                 type: number
 *                 example: 2.50
 *                 description: "Acréscimo ou desconto por unidade do produto"
 *     responses:
 *       201:
 *         description: Condição criada
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post("/", authorizeRoles("admin", "supplier"), wrapAsync(StateConditionController.create));

/**
 * @swagger
 * /state-conditions/{id}:
 *   put:
 *     summary: Atualiza uma condição regional (fornecedor só pode editar suas)
 *     tags: [StateConditions]
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
 *               cashback_percent:
 *                 type: number
 *               payment_term:
 *                 type: integer
 *               unit_adjustment:
 *                 type: number
 *     responses:
 *       200:
 *         description: Condição atualizada
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Condição não encontrada
 */
router.put("/:id", authorizeRoles("admin", "supplier"), wrapAsync(StateConditionController.update));

/**
 * @swagger
 * /state-conditions/{id}:
 *   delete:
 *     summary: Remove uma condição regional (fornecedor só pode remover suas)
 *     tags: [StateConditions]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Condição removida
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Condição não encontrada
 */
router.delete("/:id", authorizeRoles("admin", "supplier"), wrapAsync(StateConditionController.delete));

export default router;
