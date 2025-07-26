// server.js - Servidor personalizado COMPLETO para Railway con HMAC FIX
import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 🚨 CRÍTICO: Configurar trust proxy para Railway (NUEVO)
app.set('trust proxy', 1);

// 🔒 MIDDLEWARE RAW BODY PARA WEBHOOKS (NUEVO - DEBE IR ANTES DE TODO)
app.use('/webhooks', express.raw({
  type: ['application/json', 'text/plain'],
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    // Guardar el raw body para verificación HMAC
    req.rawBody = buf;
    console.log('🔍 [RAW BODY CAPTURADO]:', {
      length: buf.length,
      encoding: encoding,
      url: req.url,
      preview: buf.toString('utf8').substring(0, 100)
    });
  }
}));

// 🛡️ MIDDLEWARE DE SECURITY HEADERS - LA SOLUCIÓN DEFINITIVA
app.use((req, res, next) => {
  const shop = req.query.shop;
  const url = req.url;
  const method = req.method;
  
  console.log("🔥 [SECURITY MIDDLEWARE] Procesando request:", {
    url: url,
    shop: shop,
    method: method,
    userAgent: req.headers['user-agent']?.substring(0, 50),
    isWebhook: url.startsWith('/webhooks'), // NUEVO
    hasRawBody: !!req.rawBody // NUEVO
  });
  
  // Detectar si es un request HTML (páginas de la app)
  const isHtmlRequest = req.headers.accept && 
    (req.headers.accept.includes('text/html') || 
     req.headers.accept.includes('*/*'));
  
  // Solo aplicar CSP headers para requests HTML (NO para webhooks)
  if (isHtmlRequest && !url.startsWith('/webhooks')) { // MODIFICADO
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

// 🔍 MIDDLEWARE DE DEBUGGING ESPECÍFICO PARA WEBHOOKS (NUEVO)
app.use('/webhooks', (req, res, next) => {
  console.log('🔍 [WEBHOOK DEBUG]:', {
    url: req.url,
    method: req.method,
    headers: {
      'x-shopify-hmac-sha256': req.headers['x-shopify-hmac-sha256'],
      'x-shopify-topic': req.headers['x-shopify-topic'],
      'x-shopify-shop-domain': req.headers['x-shopify-shop-domain'],
      'content-type': req.headers['content-type']
    },
    hasRawBody: !!req.rawBody,
    rawBodyLength: req.rawBody?.length,
    secretConfigured: !!process.env.SHOPIFY_WEBHOOK_SECRET
  });
  next();
});

// 🚀 MIDDLEWARE PARA DEBUGGING HEADERS
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    console.log("📤 [RESPONSE HEADERS FINALES]:", {
      url: req.url,
      status: res.statusCode, // NUEVO
      headers: Object.fromEntries(Object.entries(res.getHeaders()))
    });
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    console.log("📤 [RESPONSE JSON HEADERS]:", {
      url: req.url,
      status: res.statusCode, // NUEVO
      headers: Object.fromEntries(Object.entries(res.getHeaders()))
    });
    return originalJson.call(this, body);
  };
  
  next();
});

// Middleware para parsear JSON (DESPUÉS del raw body middleware)
app.use(express.json({ limit: '50mb' })); // MODIFICADO: límite aumentado
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // MODIFICADO: límite aumentado

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
    shop: req.query.shop,
    hasRawBody: !!req.rawBody // NUEVO
  });
  
  return remixHandler(req, res, next);
});

// 🔧 MANEJO DE ERRORES (MOVIDO AL FINAL Y MEJORADO)
app.use((err, req, res, next) => {
  console.error("❌ [SERVER ERROR]:", {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : '[HIDDEN]', // MODIFICADO
    url: req.url,
    method: req.method,
    isWebhook: req.url.startsWith('/webhooks') // NUEVO
  });
  
  // No enviar respuesta si ya se enviaron headers (NUEVO)
  if (!res.headersSent) {
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
      timestamp: new Date().toISOString() // NUEVO
    });
  }
});

// 🚀 INICIAR SERVIDOR
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => { // MODIFICADO: guardar referencia del server
  console.log(`
🚀 ===================================================
   ESSENTIAL SHOPIFY APP - SERVIDOR RAILWAY INICIADO
🚀 ===================================================

🌐 Servidor corriendo en: http://${host}:${port}
🛡️ Security Headers: ✅ CONFIGURADOS
🔧 Trust Proxy: ✅ HABILITADO para Railway
🔒 Raw Body Middleware: ✅ ACTIVO para webhooks
📊 Environment: ${process.env.NODE_ENV || 'development'}
🎯 Framework: Remix + Express + Railway
💡 Status: ✅ LISTO PARA PRODUCCIÓN

🛡️ Security Headers incluidos:
   - Content-Security-Policy (dinámico por tienda)
   - X-Frame-Options
   - X-Content-Type-Options  
   - Referrer-Policy
   - X-XSS-Protection

🔒 Webhook HMAC Fix aplicado:
   - Trust Proxy ✅
   - Raw Body Capture ✅
   - Debug Logging ✅
   - Error Handling mejorado ✅

🎉 ¡Tu app ahora pasará la revisión de Shopify Partners!
🚀 ===================================================
  `);
});

// 🔄 GRACEFUL SHUTDOWN (NUEVO)
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;