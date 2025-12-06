import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestão de categorias de produtos (apenas admin)
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.use(authenticateJWT);
router.get("/", wrapAsync(CategoryController.list));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Detalhes de uma categoria
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 */
router.get("/:id", wrapAsync(CategoryController.get));

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma categoria (apenas admin)
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Eletrônicos"
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Categoria já existe
 */
router.post("/", authorizeRoles("admin"), wrapAsync(CategoryController.create));

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria (apenas admin)
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 */
router.put("/:id", authorizeRoles("admin"), wrapAsync(CategoryController.update));

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remove uma categoria (apenas admin)
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Categoria removida
 *       404:
 *         description: Categoria não encontrada
 */
router.delete("/:id", authorizeRoles("admin"), wrapAsync(CategoryController.delete));

export default router;
