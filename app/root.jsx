import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { json } from "@remix-run/node";

// Función para configurar headers de seguridad
function setSecurityHeaders(request, responseHeaders) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  
  // Configurar Content-Security-Policy para prevenir clickjacking
  if (shop) {
    // App embedded: permitir solo el shop específico y admin de Shopify
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const cspValue = `frame-ancestors https://${shopDomain} https://admin.shopify.com`;
    responseHeaders.set('Content-Security-Policy', cspValue);
    
    console.log(`🔒 CSP set for shop: ${shopDomain}`);
  } else {
    // No shop parameter: no permitir embedding
    responseHeaders.set('Content-Security-Policy', "frame-ancestors 'none'");
    console.log("🔒 CSP set to 'none' - no shop parameter");
  }
  
  // Headers adicionales de seguridad
  responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  responseHeaders.set('X-XSS-Protection', '1; mode=block');
}

export const loader = async ({ request }) => {
  const responseHeaders = new Headers();
  
  // Aplicar headers de seguridad
  setSecurityHeaders(request, responseHeaders);
  
  return json(
    {
      // Aquí puedes agregar datos que necesites en toda la app
      timestamp: new Date().toISOString(),
    },
    {
      headers: responseHeaders
    }
  );
};

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}