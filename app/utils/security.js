

export function setSecurityHeaders(request, response) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  
  // Configurar Content-Security-Policy para prevenir clickjacking
  if (shop) {
    // App embedded: permitir solo el shop específico y admin de Shopify
    const cspValue = `frame-ancestors https://${shop} https://admin.shopify.com`;
    response.headers.set('Content-Security-Policy', cspValue);
    
    console.log(`🔒 CSP set for shop: ${shop}`);
    console.log(`CSP Value: ${cspValue}`);
  } else {
    // No shop parameter: no permitir embedding
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
    console.log("🔒 CSP set to 'none' - no shop parameter");
  }
  
  // Headers adicionales de seguridad
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}