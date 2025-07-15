export function createSecurityMiddleware() {
  return function securityMiddleware(request, response, next) {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop') || 
                 request.headers.get('x-shopify-shop-domain') ||
                 extractShopFromHeaders(request);
    
    if (shop) {
      // Asegurar que el shop domain es válido
      const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
      
      const cspValue = `frame-ancestors https://${shopDomain} https://admin.shopify.com`;
      response.setHeader('Content-Security-Policy', cspValue);
      
      console.log(`🔒 Security headers set for: ${shopDomain}`);
    } else {
      // Si no hay shop, bloquear embedding completamente
      response.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
      console.log("🔒 No shop found - blocking all embedding");
    }
    
    // Headers adicionales de seguridad
    response.setHeader('X-Frame-Options', 'SAMEORIGIN');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (next) next();
  };
}

function extractShopFromHeaders(request) {
  // Intentar extraer shop de diferentes headers
  const shopifyHeaders = [
    'x-shopify-shop-domain',
    'x-shopify-shop',
    'shopify-shop-domain'
  ];
  
  for (const header of shopifyHeaders) {
    const shop = request.headers.get(header);
    if (shop) return shop;
  }
  
  return null;
}
