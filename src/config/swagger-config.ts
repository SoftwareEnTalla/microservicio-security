/*
 * Copyright (c) 2025 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import { CodetraceModule } from "@modules/codetrace/modules/codetrace.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { logger } from '@core/logs/logger';

 

export function setupSwagger(
  app,
  apiDoc: string = "api-docs",
  title: string = "Codetrace Service API",
  description: string = "API completa para gestión de Codetraces con documentación automática",
  version: string = "1.0"
): string {
try{
      const swaggerConfig = new DocumentBuilder()
        .setTitle(title)
        .setDescription(description)
        .setVersion(version)
        // Organiza por módulos/funcionalidades
        //.addTag("Authentication", "Operaciones de autenticación y usuarios")
        //.addTag("Codetraces", "Gestión de transacciones y procesamiento de codetraces")
        //.addTag("Subscriptions", "Manejo de suscripciones recurrentes")
        //.addTag("Webhooks", "Endpoints para integraciones externas")
        //.addTag("Reports", "Generación de reportes y analytics")
        // Configuración de seguridad (ejemplo con JWT)
        .addBearerAuth(
          {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "JWT",
            description: "Ingrese el token JWT",
            in: "header",
          },
          "JWT-auth" // Este nombre se usa como referencia en los decoradores
        )
        // Servidores (para diferentes entornos)
        .addServer("https://api.production.com", "Production")
        .addServer("https://api.staging.com", "Staging")
        .addServer("http://localhost:3000", "Local Development")
        .build();

      const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
        include: [CodetraceModule /*, AuthModule, ReportsModule*/], // Lista todos los módulos
        deepScanRoutes: true, // Escanea en profundidad
        ignoreGlobalPrefix: false, // Considera el prefijo global (api/)
        extraModels: [], // Añade esto
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          `${controllerKey}_${methodKey}`, // Genera IDs únicos
      });

      SwaggerModule.setup(apiDoc, app, swaggerDocument, {
        explorer: true, // Permite búsqueda
        swaggerOptions: {
          docExpansion: "list", // 'none', 'list' o 'full'
          filter: true, // Permite filtrar por tag
          showRequestDuration: true, // Muestra tiempo de ejecución
          persistAuthorization: true, // Guarda token entre sesiones
          tagsSorter: "alpha", // Ordena tags alfabéticamente
          operationsSorter: "alpha", // Ordena operaciones alfabéticamente
          defaultModelExpandDepth: 3, // Profundidad de modelos mostrados
          defaultModelsExpandDepth: 3,
          displayRequestDuration: true,
        },
        customCss: ".swagger-ui .topbar { background-color: #2c3e50; }", // Personalización
        customSiteTitle: "Codetrace API Docs",
        customfavIcon: "/favicon.ico",
      });
  }
  catch(error){
    logger.error("❌ Error al configurar swagger", error);
    return apiDoc;
  }
  logger.info("✅ Swagger configurado correctamente");
  return apiDoc;
}
