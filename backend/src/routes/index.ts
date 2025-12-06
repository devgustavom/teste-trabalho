import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import supplierRoutes from "./supplierRoutes";
import storeRoutes from "./storeRoutes";
import categoryRoutes from "./categoryRoutes";
import productRoutes from "./productRoutes";
import campaignRoutes from "./campaignRoutes";
import stateConditionRoutes from "./stateConditionRoutes";
import orderRoutes from "./orderRoutes";
import fileRoutes from "./fileRoutes";
import cashbackRoutes from "./cashbackRoutes";
import withdrawalRoutes from "./withdrawalRoutes";
import reportRoutes from "./reportRoutes";
// Futuramente: import usersRoutes, productsRoutes, etc.

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/stores", storeRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/state-conditions", stateConditionRoutes);
router.use("/orders", orderRoutes);
router.use("/files", fileRoutes);
router.use("/cashback", cashbackRoutes);
router.use("/withdrawals", withdrawalRoutes);
router.use("/reports", reportRoutes);
// router.use("/users", usersRoutes) ...

export default router;
