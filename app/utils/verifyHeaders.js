
export function verifySecurityHeaders(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  
  console.log("🔍 Verificando headers de seguridad...");
  console.log(`Shop parameter: ${shop}`);
  
  const expectedCSP = shop 
    ? `frame-ancestors https://${shop} https://admin.shopify.com`
    : "frame-ancestors 'none'";
    
  console.log(`Expected CSP: ${expectedCSP}`);
  
  return {
    shop,
    expectedCSP,
    isValid: Boolean(shop && shop.includes('.myshopify.com'))
  };
}