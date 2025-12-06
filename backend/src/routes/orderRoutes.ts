import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestão de pedidos (loja cria, fornecedor/admin atualiza status, sistema aplica condições regionais e calcula cashback automaticamente)
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria um pedido (apenas loja) - aplica condições regionais e calcula cashback automaticamente
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - supplier_id
 *               - items
 *             properties:
 *               store_id:
 *                 type: integer
 *                 example: 1
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               campaign_id:
 *                 type: integer
 *                 nullable: true
 *               payment_type:
 *                 type: string
 *                 example: "Pagamento à vista"
 *               is_budget:
 *                 type: boolean
 *                 example: false
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Pedido criado (condições regionais aplicadas, cashback calculado)
 *       400:
 *         description: Dados inválidos
 */
router.use(authenticateJWT);
router.post("/", authorizeRoles("admin", "store", "retailer"), wrapAsync(OrderController.create));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista pedidos (loja vê seus pedidos, fornecedor vê pedidos recebidos, admin vê todos)
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de pedidos filtrada por perfil
 */
router.get("/", wrapAsync(OrderController.list));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Detalhes de um pedido
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */
router.get("/:id", wrapAsync(OrderController.get));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualiza status do pedido (fornecedor/admin - separado, enviado, entregue, etc)
 *     tags: [Orders]
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
 *                 enum: [pending, separated, sent, delivered, cancelled]
 *                 example: "separated"
 *     responses:
 *       200:
 *         description: Status atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pedido não encontrado
 */
router.patch("/:id/status", authorizeRoles("supplier", "admin"), wrapAsync(OrderController.updateStatus));

/**
 * @swagger
 * /orders/{id}/items:
 *   get:
 *     summary: Lista itens de um pedido
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de itens do pedido
 */
router.get("/:id/items", wrapAsync(OrderController.orderItems));

export default router;
