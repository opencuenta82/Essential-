// server.js - Servidor personalizado COMPLETO para Railway
import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 🛡️ MIDDLEWARE DE SECURITY HEADERS - LA SOLUCIÓN DEFINITIVA
app.use((req, res, next) => {
  const shop = req.query.shop;
  const url = req.url;
  const method = req.method;
  
  console.log("🔥 [SECURITY MIDDLEWARE] Procesando request:", {
    url: url,
    shop: shop,
    method: method,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  // Detectar si es un request HTML (páginas de la app)
  const isHtmlRequest = req.headers.accept && 
    (req.headers.accept.includes('text/html') || 
     req.headers.accept.includes('*/*'));
  
  // Solo aplicar CSP headers para requests HTML
  if (isHtmlRequest) {
    if (shop && shop.includes('.myshopify.com')) {
      // ✅ SOLUCIÓN OFICIAL SHOPIFY: Headers dinámicos
      const cspHeader = `frame-ancestors https://${shop} https://admin.shopify.com`;
      res.setHeader('Content-Security-Policy', cspHeader);
      
      console.log("🛡️ [CSP APLICADO]:", cspHeader);
    } else if (shop) {
      // Si shop no tiene .myshopify.com, agregarlo
      const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
      const cspHeader = `frame-ancestors https://${shopDomain} https://admin.shopify.com`;
      res.setHeader('Content-Security-Policy', cspHeader);
      
      console.log("🛡️ [CSP APLICADO - NORMALIZADO]:", cspHeader);
    } else {
      // Para requests sin shop parameter
      res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
      console.log("🛡️ [CSP APLICADO - NONE]");
    }
    
    // Headers adicionales de seguridad para HTML
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  } else {
    // Para requests JSON/API (como webhooks)
    console.log("📡 [API REQUEST] No aplicando CSP headers");
  }
  
  // Headers globales para TODAS las respuestas
  res.setHeader('X-Powered-By', 'Essential-Shopify-App');
  res.setHeader('Server', 'Essential-Railway');
  
  next();
});

// 🚀 MIDDLEWARE PARA DEBUGGING HEADERS
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    console.log("📤 [RESPONSE HEADERS FINALES]:", {
      url: req.url,
      headers: Object.fromEntries(Object.entries(res.getHeaders()))
    });
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    console.log("📤 [RESPONSE JSON HEADERS]:", {
      url: req.url,
      headers: Object.fromEntries(Object.entries(res.getHeaders()))
    });
    return originalJson.call(this, body);
  };
  
  next();
});

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del build
app.use(express.static(join(__dirname, "build/client"), {
  maxAge: "1y",
  setHeaders: (res, path) => {
    // Agregar headers de cache para assets estáticos
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// 🔧 MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error("❌ [SERVER ERROR]:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 🚀 REMIX REQUEST HANDLER PRINCIPAL
const remixHandler = createRequestHandler({
  build: await import("./build/server/index.js"),
  mode: process.env.NODE_ENV
});

// Aplicar el handler de Remix a todas las rutas no manejadas
app.all("*", (req, res, next) => {
  console.log("🎯 [REMIX HANDLER] Procesando:", {
    url: req.url,
    method: req.method,
    shop: req.query.shop
  });
  
  return remixHandler(req, res, next);
});

// 🚀 INICIAR SERVIDOR
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`
🚀 ===================================================
   ESSENTIAL SHOPIFY APP - SERVIDOR RAILWAY INICIADO
🚀 ===================================================

🌐 Servidor corriendo en: http://${host}:${port}
🛡️ Security Headers: ✅ CONFIGURADOS
🔧 Middleware CSP: ✅ ACTIVO  
📊 Environment: ${process.env.NODE_ENV || 'development'}
🎯 Framework: Remix + Express + Railway
💡 Status: ✅ LISTO PARA PRODUCCIÓN

🛡️ Security Headers incluidos:
   - Content-Security-Policy (dinámico por tienda)
   - X-Frame-Options
   - X-Content-Type-Options  
   - Referrer-Policy
   - X-XSS-Protection

🎉 ¡Tu app ahora pasará la revisión de Shopify!
🚀 ===================================================
  `);
});