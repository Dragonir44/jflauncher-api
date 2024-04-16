import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../../package.json";

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
    apis: ["./src/app/routes/*.ts", "./src/app/schema/*.ts"],
};


const specs = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
    // Swageger page
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // Docs in JSON format
    app.get("api-docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(specs);
    });

    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
}

export default swaggerDocs;