import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestão de produtos (fornecedor cria/edita seus produtos, admin pode tudo)
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Products]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.use(authenticateJWT);
router.get("/", wrapAsync(ProductController.list));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Detalhes de um produto
 *     tags: [Products]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get("/:id", wrapAsync(ProductController.get));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um produto (fornecedor ou admin)
 *     tags: [Products]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - category_id
 *               - name
 *               - price
 *             properties:
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Produto Exemplo"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 99.90
 *               stock:
 *                 type: integer
 *                 example: 100
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post("/", authorizeRoles("admin", "supplier"), wrapAsync(ProductController.create));

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Products]
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
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
router.put("/:id", authorizeRoles("admin", "supplier"), wrapAsync(ProductController.update));

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags: [Products]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Produto removido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 */
router.delete("/:id", authorizeRoles("admin", "supplier"), wrapAsync(ProductController.delete));

export default router;
