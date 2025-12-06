import { Router } from "express";
import { CashbackController } from "../controllers/CashbackController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";
import multer from "multer";
import path from "path";

// Configuração de storage para upload de comprovantes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cashback-proof-${uniqueSuffix}-${file.originalname.replace(/[^A-Za-z0-9_.-]/g, '_')}`);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF, JPG e PNG são permitidos'));
    }
  }
});

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cashback
 *   description: Gestão de cashback (gerado automaticamente nos pedidos, loja consulta histórico, admin confirma)
 */

/**
 * @swagger
 * /cashback:
 *   get:
 *     summary: Lista histórico de cashback (loja vê seus, admin vê todos)
 *     tags: [Cashback]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Lista de entradas de cashback
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   value:
 *                     type: number
 *                   confirmed:
 *                     type: boolean
 *                   order:
 *                     type: object
 */
router.use(authenticateJWT);
router.get("/", wrapAsync(CashbackController.list));

/**
 * @swagger
 * /cashback/{id}/confirm:
 *   patch:
 *     summary: Confirma cashback (apenas admin)
 *     tags: [Cashback]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Cashback confirmado
 *       404:
 *         description: Cashback não encontrado
 */
router.patch("/:id/confirm", authorizeRoles("admin"), wrapAsync(CashbackController.confirm));

/**
 * @swagger
 * /cashback/{id}/proof:
 *   post:
 *     summary: Upload de comprovante (DANFE ou foto do orçamento) para cashback
 *     tags: [Cashback]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Comprovante enviado com sucesso
 *       400:
 *         description: Arquivo não enviado ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Cashback não encontrado
 */
router.post("/:id/proof", authenticateJWT, upload.single("file"), wrapAsync(CashbackController.uploadProof));

/**
 * @swagger
 * /cashback/{id}/proof:
 *   get:
 *     summary: Download de comprovante de cashback
 *     tags: [Cashback]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Arquivo do comprovante
 *       404:
 *         description: Comprovante não encontrado
 */
router.get("/:id/proof", authenticateJWT, wrapAsync(CashbackController.downloadProof));

export default router;
