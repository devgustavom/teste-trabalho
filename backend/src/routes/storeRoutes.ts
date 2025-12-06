import { Router } from "express";
import { StoreController } from "../controllers/StoreController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Gestão de lojas (admin cria, loja edita seus dados)
 */

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Lista todas as lojas
 *     tags: [Stores]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de lojas
 */
router.use(authenticateJWT);
router.get("/", authorizeRoles("admin", "store", "retailer"), wrapAsync(StoreController.list));

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Detalhes de uma loja
 *     tags: [Stores]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Loja encontrada
 *       404:
 *         description: Loja não encontrada
 */
router.get("/:id", authorizeRoles("admin", "store", "retailer"), wrapAsync(StoreController.get));

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Cria uma loja (apenas admin)
 *     tags: [Stores]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - name
 *               - state
 *             properties:
 *               user_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               responsible:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Loja criada
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authorizeRoles("admin"), wrapAsync(StoreController.create));

/**
 * @swagger
 * /stores/{id}:
 *   put:
 *     summary: Atualiza uma loja (loja só pode editar seus dados)
 *     tags: [Stores]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Loja atualizada
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Loja não encontrada
 */
router.put("/:id", authorizeRoles("admin", "store", "retailer"), wrapAsync(StoreController.update));

/**
 * @swagger
 * /stores/{id}:
 *   delete:
 *     summary: Remove uma loja (apenas admin)
 *     tags: [Stores]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Loja removida
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Loja não encontrada
 */
router.delete("/:id", authorizeRoles("admin"), wrapAsync(StoreController.delete));

export default router;
