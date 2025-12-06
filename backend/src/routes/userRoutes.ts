import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de usuários (admin, fornecedor, loja, televendas)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de usuários (sem senha)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.use(authenticateJWT, authorizeRoles("admin"));
router.get("/", wrapAsync(UserController.list));
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Detalhes de um usuário
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Não encontrado
 */
router.get( "/:id", wrapAsync(UserController.get));
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um usuário (
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           example:
 *             name: "José da Silva"
 *             email: "jsilva@exemplo.com"
 *             password: "password"
 *             role: "admin"
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Dados já existentes ou faltando
 */
router.post("/", wrapAsync(UserController.create));
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           example:
 *             name: "Nome atualizado"
 *             email: "novo@exemplo.com"
 *             role: "loja"
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Não encontrado
 */
router.put("/:id", wrapAsync(UserController.update));
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       204:
 *         description: Excluído
 *       404:
 *         description: Não encontrado
 */
router.delete("/:id", wrapAsync(UserController.delete));

export default router;
