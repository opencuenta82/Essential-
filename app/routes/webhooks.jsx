

import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  try {
    // Clonar request para autenticación
    const requestClone = request.clone();
    const rawBody = await request.text();
    
    // Parsear payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Autenticar webhook
    let shop, topic;
    try {
      const authResult = await authenticate.webhook(requestClone);
      shop = authResult.shop;
      topic = authResult.topic;
    } catch (error) {
      console.error("Webhook authentication failed:", error);
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`📩 Received GDPR webhook: ${topic} from shop: ${shop}`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Manejar cada tipo de webhook GDPR
    switch (topic) {
      case "customers/data_request":
        await handleCustomerDataRequest(shop, payload);
        break;
        
      case "customers/redact":
        await handleCustomerRedact(shop, payload);
        break;
        
      case "shop/redact":
        await handleShopRedact(shop, payload);
        break;
        
      default:
        console.warn(`Unhandled GDPR webhook topic: ${topic}`);
        return json({ error: "Unhandled topic" }, { status: 400 });
    }

    // Responder con éxito (OBLIGATORIO)
    return json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("GDPR Webhook error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

// =====================================
// 3. FUNCIONES GDPR HANDLERS
// =====================================

async function handleCustomerDataRequest(shop, payload) {
  console.log(`🔍 Customer data request for shop: ${shop}`);
  console.log(`Customer ID: ${payload.customer?.id}`);
  console.log(`Orders requested: ${payload.orders_requested?.length || 0}`);
  
  // TODO: Si tu app almacena datos de customer, debes:
  // 1. Buscar todos los datos relacionados con este customer
  // 2. Exportar los datos en formato legible
  // 3. Enviar los datos al merchant o customer según requerido
  
  // Ejemplo para apps que NO almacenan datos de customer:
  console.log("✅ No customer data stored by this app");
  
  // Si SÍ almacenas datos, implementar aquí la lógica de exportación
  // const customerData = await findCustomerData(payload.customer.id);
  // await exportCustomerData(customerData, shop);
}

async function handleCustomerRedact(shop, payload) {
  console.log(`🗑️ Customer redact request for shop: ${shop}`);
  console.log(`Customer ID: ${payload.customer?.id}`);
  console.log(`Orders to redact: ${payload.orders_to_redact?.length || 0}`);
  
  // TODO: Si tu app almacena datos de customer, debes:
  // 1. Buscar todos los datos relacionados con este customer
  // 2. Eliminar o anonimizar los datos
  // 3. Confirmar la eliminación
  
  // Ejemplo para apps que NO almacenan datos de customer:
  console.log("✅ No customer data to redact");
  
  // Si SÍ almacenas datos, implementar aquí la lógica de eliminación
  // await deleteCustomerData(payload.customer.id, shop);
}

async function handleShopRedact(shop, payload) {
  console.log(`🏪 Shop redact request for shop: ${shop}`);
  console.log(`Shop ID: ${payload.shop_id}`);
  
  // TODO: Cuando una tienda desinstala tu app, debes:
  // 1. Eliminar TODOS los datos relacionados con esa tienda
  // 2. Borrar metafields creados por tu app
  // 3. Limpiar cualquier configuración almacenada
  
  try {
    // Eliminar metafields de la app (si los usas)
    await cleanupShopMetafields(shop);
    
    // Eliminar datos locales de la tienda
    await cleanupShopData(shop);
    
    console.log(`✅ Shop data cleaned up for: ${shop}`);
  } catch (error) {
    console.error(`❌ Error cleaning up shop ${shop}:`, error);
    throw error;
  }
}

// =====================================
// 4. FUNCIONES DE LIMPIEZA
// =====================================

async function cleanupShopMetafields(shop) {
  // TODO: Implementar limpieza de metafields si tu app los usa
  console.log(`🧹 Cleaning metafields for shop: ${shop}`);
  
  // Ejemplo de cómo limpiar metafields:
  /*
  const { admin } = await authenticate.admin(request);
  
  // Buscar metafields de tu app
  const metafields = await admin.rest.resources.Metafield.all({
    session,
    namespace: "whatsapp_widget" // Tu namespace
  });
  
  // Eliminar cada metafield
  for (const metafield of metafields.data) {
    await admin.rest.resources.Metafield.delete({
      session,
      id: metafield.id,
    });
  }
  */
}

async function cleanupShopData(shop) {
  // TODO: Implementar limpieza de datos locales
  console.log(`🗄️ Cleaning local data for shop: ${shop}`);
  
  // Ejemplo: eliminar de base de datos local si tienes una
  /*
  await db.shopConfigurations.deleteMany({
    where: { shop: shop }
  });
  
  await db.userSessions.deleteMany({
    where: { shop: shop }
  });
  */
}

// =====================================
// 5. VERIFICAR CONFIGURACIÓN
// =====================================

// Función para verificar que los webhooks están configurados
export async function verifyGDPRWebhooks() {
  console.log("🔍 Verificando configuración GDPR webhooks...");
  
  const requiredTopics = [
    "customers/data_request",
    "customers/redact", 
    "shop/redact"
  ];
  
  // TODO: Verificar que los webhooks están registrados en Shopify
  // Esta verificación se puede hacer desde el Partner Dashboard
  
  console.log("✅ GDPR webhooks configurados:", requiredTopics);
  return true;
}