import { Router } from "express";
import { WithdrawalController } from "../controllers/WithdrawalController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Withdrawals
 *   description: Solicitação de saque de cashback via PIX (loja solicita, admin aprova/nega)
 */

/**
 * @swagger
 * /withdrawals:
 *   get:
 *     summary: Lista solicitações de saque (loja vê suas, admin vê todas)
 *     tags: [Withdrawals]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de solicitações de saque
 */
router.use(authenticateJWT);
router.get("/", wrapAsync(WithdrawalController.list));

/**
 * @swagger
 * /withdrawals:
 *   post:
 *     summary: Solicita saque de cashback via PIX (apenas loja)
 *     tags: [Withdrawals]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - pix_key
 *               - amount
 *             properties:
 *               store_id:
 *                 type: integer
 *                 example: 1
 *               pix_key:
 *                 type: string
 *                 example: "12345678900"
 *                 description: "Chave PIX para recebimento"
 *               amount:
 *                 type: number
 *                 example: 500.00
 *                 description: "Valor a sacar (não pode exceder saldo confirmado)"
 *     responses:
 *       201:
 *         description: Solicitação de saque criada
 *       400:
 *         description: Valor superior ao disponível ou dados inválidos
 */
router.post("/", authorizeRoles("store", "retailer"), wrapAsync(WithdrawalController.request));

/**
 * @swagger
 * /withdrawals/{id}/status:
 *   patch:
 *     summary: Atualiza status da solicitação de saque (apenas admin - pending, confirmed, rejected)
 *     tags: [Withdrawals]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, rejected]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Status atualizado
 *       404:
 *         description: Solicitação não encontrada
 */
router.patch("/:id/status", authorizeRoles("admin"), wrapAsync(WithdrawalController.updateStatus));

export default router;
