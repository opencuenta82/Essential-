import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import { installGlobals } from "@remix-run/node";
import express from "express";

installGlobals();

async function startServer() {
  const viteDevServer = undefined;
  
  // Importar el build del servidor
  const build = await import("./build/server/index.js");

  const remixHandler = createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : build,
  });

  const app = express();

  // Configurar para servir archivos estáticos
  app.use(express.static("build/client"));

  // Manejar todas las rutas con Remix
  app.all("*", remixHandler);

  // Configurar puerto y host para Railway
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || "0.0.0.0";

  app.listen(port, host, () => {
    console.log(`✅ Express server listening on http://${host}:${port}`);
    
    if (process.env.NODE_ENV === "development") {
      broadcastDevReady(build);
    }
  });
}

// Iniciar el servidor
startServer().catch((error) => {
  console.error("❌ Error starting server:", error);
  process.exit(1);
});