// app/routes/api.whatsapp-config.tsx
import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const config = {
      phoneNumber: formData.get("phoneWithCode"),
      message: formData.get("startMessage"),
      position: formData.get("position"),
      color: formData.get("color"),
      icon: formData.get("icon"),
      enabled: true, // Siempre habilitado cuando se guarda desde el formulario
    };

    // Guardar en Shopify Metafields
    const metafields = [
      {
        namespace: "whatsapp_widget",
        key: "phone_number",
        value: config.phoneNumber,
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget", 
        key: "message",
        value: config.message,
        type: "multi_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "position", 
        value: config.position,
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "button_color",
        value: config.color,
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "icon",
        value: config.icon,
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "enabled",
        value: "true",
        type: "boolean",
      },
    ];

    // Crear/actualizar metafields en la tienda
    for (const metafield of metafields) {
      await admin.rest.resources.Metafield.save({
        session: admin.session,
        namespace: metafield.namespace,
        key: metafield.key,
        value: metafield.value,
        type: metafield.type,
        owner_resource: "shop",
        owner_id: admin.session.shop.replace(".myshopify.com", ""),
      });
    }

    return json({ 
      success: true, 
      message: "Configuración guardada exitosamente",
      config 
    });
    
  } catch (error) {
    console.error("Error guardando configuración:", error);
    return json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}