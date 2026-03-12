import app from './app';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const PORT = process.env.PORT ?? 3000;

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
if (
  process.env.NODE_ENV === 'production' &&
  jwtSecret &&
  jwtSecret.length < 32
) {
  console.warn(
    '⚠️ Warning: JWT_SECRET should be at least 32 characters in production'
  );
}

app.listen(Number(PORT), () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV ?? 'development'} mode`
  );
  console.log(
    `Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
});
