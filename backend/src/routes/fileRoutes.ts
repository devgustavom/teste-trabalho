import { Router } from "express";
import { FileController } from "../controllers/FileController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";
import multer from "multer";
import path from "path";

// Configuração de storage seguro (upload na pasta /uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^A-Za-z0-9_.-]/g, '_'));
  }
});
const upload = multer({ storage });

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Upload e download de arquivos (PDF, planilhas, imagens) - fornecedor envia, loja/admin baixa
 */

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Lista arquivos disponíveis (pode filtrar por supplier_id via query)
 *     tags: [Files]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: integer
 *         description: Filtrar por fornecedor
 *     responses:
 *       200:
 *         description: Lista de arquivos
 */
router.use(authenticateJWT);
router.get("/", wrapAsync(FileController.list));

/**
 * @swagger
 * /files/{id}/download:
 *   get:
 *     summary: Download de um arquivo
 *     tags: [Files]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Arquivo baixado
 *       404:
 *         description: Arquivo não encontrado
 */
router.get("/:id/download", wrapAsync(FileController.download));

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload de arquivo (apenas fornecedor) - form-data com campo 'file'
 *     tags: [Files]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - supplier_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo (PDF, imagem, planilha)
 *               supplier_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               file_type:
 *                 type: string
 *                 example: "pdf"
 *     responses:
 *       201:
 *         description: Arquivo enviado com sucesso
 *       400:
 *         description: Arquivo não enviado ou dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.post("/", authorizeRoles("supplier"), upload.single("file"), wrapAsync(FileController.upload));

/**
 * @swagger
 * /files/{id}:
 *   delete:
 *     summary: Remove um arquivo (fornecedor remove seus, admin remove qualquer)
 *     tags: [Files]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Arquivo removido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Arquivo não encontrado
 */
router.delete("/:id", authorizeRoles("supplier", "admin"), wrapAsync(FileController.delete));

export default router;
