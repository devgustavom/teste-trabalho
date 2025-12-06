import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Central de Compras - API",
      version: "1.0.0",
      description: `API para Central de Compras: gestão de lojas, fornecedores, produtos, campanhas, pedidos, cashback, uploads e fluxo completo de marketplace B2B.

Perfis: Administrador, Fornecedor, Lojista, Televendas.
`
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./src/routes/*.ts",
    "./src/models/*.ts"
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
