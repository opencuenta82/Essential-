import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { convertTo24Hour } from "./timeUtils";

export async function actionHandler({ request }: ActionFunctionArgs) {
  let cspHeaders: Record<string, string> = {};

  try {
    const { admin, session } = await authenticate.admin(request);
    
    if (!session || !session.shop) {
      return json({
        success: false,
        error: "Sesión no válida"
      }, { status: 401 });
    }

    const shopDomain = session.shop;
    cspHeaders = {
      "Content-Security-Policy": `frame-ancestors https://${shopDomain} https://admin.shopify.com;`,
      "X-Frame-Options": "ALLOWALL",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block"
    };

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, {
        status: 405,
        headers: cspHeaders
      });
    }

    const userAgent = request.headers.get("User-Agent") || "";
    
    if (userAgent.includes("bot") || userAgent.includes("crawler")) {
      return json({ error: "Forbidden" }, {
        status: 403,
        headers: cspHeaders
      });
    }

    console.log("✅ Sesión válida:", {
      shop: session.shop,
      accessToken: session.accessToken ? "EXISTS" : "MISSING"
    });

    const formData = await request.formData();
    const config = {
      phoneNumber: String(formData.get("phoneWithCode") || "").replace(/[^\d+]/g, '').slice(0, 20),
      message: String(formData.get("startMessage") || "").trim().slice(0, 500),
      position: String(formData.get("position") || "").replace(/[^a-z-]/g, ''),
      color: String(formData.get("color") || "").replace(/[^#a-fA-F0-9]/g, ''),
      icon: String(formData.get("icon") || "").slice(0, 5),
      buttonStyle: String(formData.get("buttonStyle") || "").replace(/[^a-z0-9]/g, ''),
      logoUrl: String(formData.get("logoUrl") || "").slice(0, 50000),
      activeHours: String(formData.get("activeHours") || "").replace(/[^a-z0-9]/g, ''),
      startTime: String(formData.get("startTime") || "").replace(/[^0-9:]/g, ''),
      endTime: String(formData.get("endTime") || "").replace(/[^0-9:]/g, ''),
      isActive24Hours: String(formData.get("isActive24Hours") || "false"),
      activeDays: String(formData.get("activeDays") || "").replace(/[^a-z,]/g, ''),
    };

    console.log("Configuración recibida:", config);

    // Obtener Shop ID
    let shopId;
    try {
      const shopQuery = await admin.graphql(`
        query {
          shop {
            id
            myshopifyDomain
            name
          }
        }
      `);

      const shopResponse = await shopQuery.json();

      if (shopResponse.data?.shop?.id) {
        shopId = shopResponse.data.shop.id;
        console.log("✅ Shop ID obtenido con GraphQL:", shopId);
      } else {
        throw new Error("No se pudo obtener shop ID con GraphQL");
      }
    } catch (graphqlError) {
      const shopDomain = session.shop;
      const shopName = shopDomain.replace('.myshopify.com', '');
      shopId = `gid://shopify/Shop/${shopName}`;
      console.log("✅ Shop ID construido desde sesión:", shopId);
    }

    // Preparar metafields
    const metafieldsData = [
      {
        namespace: "whatsapp_widget",
        key: "phone_number",
        value: String(config.phoneNumber || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "message",
        value: String(config.message || ""),
        type: "multi_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "position",
        value: String(config.position || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "button_color",
        value: String(config.color || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "icon",
        value: String(config.icon || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "button_style",
        value: String(config.buttonStyle || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "active_hours",
        value: String(config.activeHours || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "start_time",
        value: String(config.startTime || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "end_time",
        value: String(config.endTime || ""),
        type: "single_line_text_field",
      },
      {
        namespace: "whatsapp_widget",
        key: "is_active_24_hours",
        value: String(config.isActive24Hours || "false"),
        type: "boolean",
      },
      {
        namespace: "whatsapp_widget",
        key: "active_days",
        value: String(config.activeDays || ""),
        type: "single_line_text_field",
      },
    ];

    // Solo agregar logo_url si no está vacío
    if (config.logoUrl && typeof config.logoUrl === 'string' && config.logoUrl.trim() !== '') {
      metafieldsData.push({
        namespace: "whatsapp_widget",
        key: "logo_url",
        value: String(config.logoUrl),
        type: "single_line_text_field",
      });
    }

    console.log("📝 Intentando guardar metafields con shopId:", shopId);

    // Guardar metafields
    const mutation = await admin.graphql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
            type
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `, {
      variables: {
        metafields: metafieldsData.map(metafield => ({
          namespace: metafield.namespace,
          key: metafield.key,
          type: metafield.type,
          value: metafield.value,
          ownerId: shopId
        }))
      }
    });

    const result = await mutation.json();

    // Verificar errores
    if (result.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("❌ Errores en metafields:", result.data.metafieldsSet.userErrors);
      return json({
        success: false,
        error: "Error al guardar metafields",
        details: result.data.metafieldsSet.userErrors
      }, {
        status: 400,
        headers: cspHeaders
      });
    }

    const savedMetafields = result.data?.metafieldsSet?.metafields || [];
    console.log("✅ Metafields guardados exitosamente:", savedMetafields);

    return json({
      success: true,
      message: "Configuración guardada exitosamente",
      config,
      savedMetafields,
      shopInfo: {
        domain: session.shop,
        shopId: shopId
      }
    }, {
      headers: cspHeaders
    });

  } catch (error) {
    console.error("💥 Error guardando configuración:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');

    return json({
      success: false,
      error: "Error al guardar la configuración",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, {
      status: 500,
      headers: cspHeaders
    });
  }
}