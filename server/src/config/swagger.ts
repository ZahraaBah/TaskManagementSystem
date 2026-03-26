import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description: 'API documentation for the Task Management System',
      contact: {
        name: 'Your Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
  process.env.NODE_ENV === 'production'
    ? './dist/modules/**/*.js'   // ← prod : fichiers compilés
    : './src/modules/**/*.ts'    // ← dev : fichiers source
],
 
};

export const swaggerSpec = swaggerJsdoc(options);