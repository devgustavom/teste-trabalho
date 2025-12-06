import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth";
import { wrapAsync } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Relatórios administrativos (pedidos, faturamento, cashback)
 */

/**
 * @swagger
 * /reports/orders:
 *   get:
 *     summary: Relatório de pedidos com filtros e estatísticas
 *     tags: [Reports]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: integer
 *         description: Filtrar por fornecedor
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Filtrar por loja
 *     responses:
 *       200:
 *         description: Relatório de pedidos com estatísticas
 */
router.use(authenticateJWT);
router.get("/orders", wrapAsync(ReportController.orders));

/**
 * @swagger
 * /reports/revenue:
 *   get:
 *     summary: Relatório de faturamento (pode agrupar por fornecedor ou loja)
 *     tags: [Reports]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [supplier, store]
 *         description: Agrupar por fornecedor ou loja
 *     responses:
 *       200:
 *         description: Relatório de faturamento
 */
router.get("/revenue", wrapAsync(ReportController.revenue));

/**
 * @swagger
 * /reports/cashback:
 *   get:
 *     summary: Relatório de cashback com estatísticas e agrupamento por loja
 *     tags: [Reports]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: confirmed
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Relatório de cashback
 */
router.get("/cashback", wrapAsync(ReportController.cashback));

export default router;

