import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/ormconfig";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
AppDataSource.initialize()
  .then(() => {
    console.log("🟢 DB conectado");
    // Inicia servidor apenas após conexão com DB
    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro de conexão DB", error);
    process.exit(1);
  });

app.use("/api", routes);
app.use(errorHandler);
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => res.send("Central de Compras API Online"));
