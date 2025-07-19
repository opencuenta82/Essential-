import { json } from "@remix-run/node";

// Loader para manejar requests GET (para verificación)
export const loader = async () => {
  return json({ 
    message: "GDPR Webhook endpoint is working",
    methods: ["POST"],
    status: "active"
  }, { status: 200 });
};

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const topic = request.headers.get("x-shopify-topic");
    const shopDomain = request.headers.get("x-shopify-shop-domain");
    const hmac = request.headers.get("x-shopify-hmac-sha256");
    
    // Obtener el body del webhook
    const body = await request.json();
    
    console.log(`🔒 GDPR Webhook recibido: ${topic}`, {
      shop: shopDomain,
      data: body
    });

    // Procesar según el tipo de webhook GDPR
    switch (topic) {
      case "customers/data_request":
        console.log("📋 Solicitud de datos del cliente:", body);
        // TODO: Implementar lógica para proporcionar datos del cliente
        // Debes enviar los datos del cliente al store owner
        await handleCustomerDataRequest(body, shopDomain);
        break;
        
      case "customers/redact":
        console.log("🗑️ Eliminar datos del cliente:", body);
        // TODO: Implementar lógica para eliminar datos del cliente específico
        await handleCustomerRedact(body, shopDomain);
        break;
        
      case "shop/redact":
        console.log("🏪 Eliminar datos de la tienda:", body);
        // TODO: Implementar lógica para eliminar TODOS los datos de la tienda
        await handleShopRedact(body, shopDomain);
        break;
        
      default:
        console.log("⚠️ Webhook topic no reconocido:", topic);
    }
    
    // ⚡ CRÍTICO: Responder 200 INMEDIATAMENTE
    return json({ 
      success: true, 
      message: "GDPR webhook processed successfully",
      topic: topic 
    }, { 
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
    
  } catch (error) {
    console.error("❌ Error procesando webhook GDPR:", error);
    
    // ⚡ CRÍTICO: Incluso en error, responder 200 para evitar reintentos de Shopify
    return json({ 
      success: false, 
      error: "Internal server error",
      message: "Webhook received but processing failed" 
    }, { 
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

// Funciones auxiliares para manejar cada tipo de webhook GDPR
async function handleCustomerDataRequest(data, shopDomain) {
  // TODO: Implementar la lógica para recopilar y enviar datos del cliente
  console.log(`Procesando solicitud de datos para cliente ${data.customer?.id} en tienda ${shopDomain}`);
  
  // Ejemplo de lo que deberías hacer:
  // 1. Buscar todos los datos del cliente en tu base de datos
  // 2. Compilar los datos en un formato legible
  // 3. Enviar los datos al store owner (por email o sistema)
}

async function handleCustomerRedact(data, shopDomain) {
  // TODO: Implementar la lógica para eliminar datos del cliente
  console.log(`Eliminando datos del cliente ${data.customer?.id} en tienda ${shopDomain}`);
  
  // Ejemplo de lo que deberías hacer:
  // 1. Encontrar todos los registros del cliente en tu base de datos
  // 2. Eliminar o anonimizar los datos personales
  // 3. Mantener logs de la eliminación para auditoría
}

async function handleShopRedact(data, shopDomain) {
  // TODO: Implementar la lógica para eliminar TODOS los datos de la tienda
  console.log(`Eliminando TODOS los datos de la tienda ${shopDomain}`);
  
  // Ejemplo de lo que deberías hacer:
  // 1. Eliminar todos los datos relacionados con esta tienda
  // 2. Eliminar configuraciones, logs, archivos, etc.
  // 3. Mantener logs de la eliminación para auditoría
  
  // ⚠️ CUIDADO: Esta operación elimina TODOS los datos de la tienda
}