import { Router } from "express";
import { SupplierController } from "../controllers/SupplierController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Gestão de fornecedores (admin cria, fornecedor edita seus dados)
 */

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Cria um fornecedor (apenas admin)
 *     tags: [Suppliers]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - legal_name
 *               - state
 *             properties:
 *               user_id:
 *                 type: integer
 *               legal_name:
 *                 type: string
 *               trade_name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               state:
 *                 type: string
 *               commercial_policy:
 *                 type: string
 *               whatsapp_link:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fornecedor criado
 *       400:
 *         description: Dados inválidos
 */
router.use(authenticateJWT);
router.post("/", authorizeRoles("admin"), wrapAsync(SupplierController.create));

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Lista todos os fornecedores
 *     tags: [Suppliers]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de fornecedores
 */
router.get("/", wrapAsync(SupplierController.list));

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Detalhes de um fornecedor
 *     tags: [Suppliers]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Fornecedor encontrado
 *       404:
 *         description: Fornecedor não encontrado
 */
router.get("/:id", wrapAsync(SupplierController.get));

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     summary: Atualiza um fornecedor (fornecedor só pode editar seus dados)
 *     tags: [Suppliers]
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
 *               legal_name:
 *                 type: string
 *               commercial_policy:
 *                 type: string
 *               whatsapp_link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fornecedor atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Fornecedor não encontrado
 */
router.put("/:id", authorizeRoles("admin", "supplier"), wrapAsync(SupplierController.update));

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Remove um fornecedor (apenas admin)
 *     tags: [Suppliers]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Fornecedor removido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Fornecedor não encontrado
 */
router.delete("/:id", authorizeRoles("admin"), wrapAsync(SupplierController.delete));

export default router;
