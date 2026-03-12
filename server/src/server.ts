import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const PORT = process.env.PORT ?? 3000;

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
}); // ← Supprimé la parenthèse en trop