import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../../package.json";

export default (app: Express) => {
    const options: swaggerJsdoc.Options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "JFL API",
                version: version,
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ],

        },
        apis: ["src/app/routes/*.ts"],
    };

  const specs = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};