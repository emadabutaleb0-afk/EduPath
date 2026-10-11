import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./api.js";
import { initializeDatabase } from "./db/init.js";
import { securityHeaders } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize Database tables and seed initial records if DATABASE_URL is configured
  await initializeDatabase();

  const app = express();
  const server = createServer(app);

  // Security Headers
  app.use(securityHeaders);

  // Structured Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLine = `${new Date().toISOString()} [${req.method}] ${req.originalUrl || req.url} -> ${res.statusCode} (${duration}ms)`;
      if (res.statusCode >= 400) {
        console.warn(`⚠️ ${logLine}`);
      } else {
        console.log(`ℹ️ ${logLine}`);
      }
    });
    next();
  });

  // Enable JSON parsing and mount API Router
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));
  app.use("/api", apiRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 EduPath Secure Server running on http://localhost:${port}/ (Environment: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch(console.error);
