import { useState } from "react";
import * as React from "react";
import { useNavigate } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

// API ACTION para guardar configuración
function convertTo24Hour(timeString: string): string {

  if (!timeString) return timeString;

  // Si ya está en formato 24h (no tiene AM/PM), devolver tal como está
  if (!timeString.includes('AM') && !timeString.includes('PM')) {
    return timeString;
  }

  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours);

  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin, session } = await authenticate.admin(request);

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    // Verificar que la sesión existe
    if (!session || !session.shop) {
      console.error("❌ Sesión no válida:", session);
      return json({
        success: false,
        error: "Sesión no válida",
        details: "No se pudo obtener la información de la tienda"
      }, { status: 401 });
    }

    console.log("✅ Sesión válida:", {
      shop: session.shop,
      accessToken: session.accessToken ? "EXISTS" : "MISSING"
    });

    const formData = await request.formData();

    // Extraer datos del formulario
    // ✅ DESPUÉS (agregar estas 2 líneas)
    const config = {
      phoneNumber: formData.get("phoneWithCode"),
      message: formData.get("startMessage"),
      position: formData.get("position"),
      color: formData.get("color"),
      icon: formData.get("icon"),
      buttonStyle: formData.get("buttonStyle"),
      logoUrl: formData.get("logoUrl"),
      activeHours: formData.get("activeHours"),
      startTime: formData.get("startTime"),        // ← AGREGAR
      endTime: formData.get("endTime"),            // ← AGREGAR
      isActive24Hours: formData.get("isActive24Hours"),
      activeDays: formData.get("activeDays"),
    };
    console.log("Configuración recibida:", config);

    // MÉTODO 1: Intentar obtener Shop ID con GraphQL
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

    // Preparar metafields actualizados - SOLO campos con valores
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
      // Nuevos campos
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

    // Filtrar metafields con valores vacíos
    const validMetafields = metafieldsData.filter(metafield => {
      const value = metafield.value.trim();
      return value !== '' && value !== 'undefined' && value !== 'null';
    });

    console.log("📝 Intentando guardar metafields con shopId:", shopId);

    // Usar UNA SOLA MUTACIÓN con todos los metafields
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

    console.log("📊 Resultado completo de GraphQL:", JSON.stringify(result, null, 2));

    // Verificar errores
    if (result.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("❌ Errores en metafields:", result.data.metafieldsSet.userErrors);
      return json({
        success: false,
        error: "Error al guardar metafields",
        details: result.data.metafieldsSet.userErrors
      }, { status: 400 });
    }

    // Verificar que se guardaron los metafields
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
    });

  } catch (error) {
    console.error("💥 Error guardando configuración:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');

    return json({
      success: false,
      error: "Error al guardar la configuración",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }

}
declare global {
  interface Window {
    compressAndSetImage: (file: File) => void;
  }
}
export default function ConfigWhatsApp() {
  const navigate = useNavigate();

  // Estados existentes
  const [position, setPosition] = useState("bottom-right");
  const [color, setColor] = useState("#25D366");
  const [icon, setIcon] = useState("💬");
  const [countryCode, setCountryCode] = useState("51");
  const [phoneNumber, setPhoneNumber] = useState("999999999");
  const [startMessage, setStartMessage] = useState("¡Hola! Me interesa tu producto");

  // Nuevos estados
  const [buttonStyle, setButtonStyle] = useState("style1");
  const [logoUrl, setLogoUrl] = useState("");
  const [isActive24Hours, setIsActive24Hours] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [activeDays, setActiveDays] = useState("monday,tuesday,wednesday,thursday,friday");

  // const fetcher = useFetcher();
  const fetcher = useFetcher<any>();



  const createButton = async () => {
    // Validar campos requeridos
    if (!phoneNumber.trim()) {
      alert("Por favor ingresa un número de teléfono válido");
      return;
    }

    if (!startMessage.trim()) {
      alert("Por favor ingresa un mensaje inicial");
      return;
    }

    // Crear objeto con datos del formulario
    const formData = new FormData();
    formData.append("phoneWithCode", countryCode + phoneNumber);
    formData.append("startMessage", startMessage);
    formData.append("position", position);
    formData.append("color", color);
    formData.append("icon", icon);

    // Nuevos campos
    formData.append("buttonStyle", buttonStyle);
    formData.append("logoUrl", logoUrl);
    formData.append("activeHours", isActive24Hours ? "24hours" : "custom");
    // formData.append("startTime", startTime);
    // formData.append("endTime", endTime);

    formData.append("startTime", convertTo24Hour(startTime));
    formData.append("endTime", convertTo24Hour(endTime));
    formData.append("isActive24Hours", isActive24Hours.toString());
    formData.append("activeDays", activeDays);

    console.log("📤 Enviando datos:", {
      phone: countryCode + phoneNumber,
      message: startMessage,
      position,
      color,
      icon,
      buttonStyle,
      logoUrl,
      activeHours: isActive24Hours ? "24hours" : "custom",
      // startTime,
      // endTime,

      startTime: convertTo24Hour(startTime),
      endTime: convertTo24Hour(endTime),
      isActive24Hours,
      activeDays
    });

    // Enviar a la API (misma ruta)
    fetcher.submit(formData, {
      method: "POST"
    });
  };

  // Efecto para redirigir cuando llega la respuesta exitosa
  React.useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.shopInfo?.domain) {
      console.log("✅ Datos recibidos, iniciando redirección...");

      // Extraer el nombre de la tienda del dominio
      const shopDomain = fetcher.data.shopInfo.domain;
      const shopName = shopDomain.replace('.myshopify.com', '');

      // Construir la URL de integraciones   de aplicaciones
      const themeEditorUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps`;

      console.log("🔗 URL construida:", themeEditorUrl);
      console.log("🔗 Shop name:", shopName);

      // Redirigir después de 2 segundos
      const redirectTimeout = setTimeout(() => {
        console.log("🚀 Ejecutando redirección...");
        window.open(themeEditorUrl, '_blank');

        // RESETEAR el formulario después de la redirección
        setTimeout(() => {
          console.log("🔄 Reseteando formulario...");
          window.location.reload();
        }, 1000);

      }, 2000);

      // Limpiar timeout si el componente se desmonta
      return () => clearTimeout(redirectTimeout);
    }
  }, [fetcher.data]);

  // Mostrar estado de envío
  const isSubmitting = fetcher.state === "submitting";
  const isSuccess = fetcher.data?.success;
  const hasError = fetcher.data?.success === false;



  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      padding: '60px 20px'
    }}>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          margin: '0 0 20px 0',
          letterSpacing: '-2px',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          🚀 Creador de Botones WhatsApp
        </h1>
        <p style={{
          fontSize: '20px',
          margin: '0',
          fontWeight: '400',
          opacity: '0.9'
        }}>
          Crea botones de contacto profesionales para tu negocio
        </p>
      </div>

      {/* Contenedor principal */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '50px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>

        {/* Tipo de Botón */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '16px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🎨 Tipo de Botón WhatsApp
          </label>
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '2px solid #e2e8f0',
            overflowX: 'auto'
          }}>
            {[
              {
                value: "style1",
                name: "Estilo 1",
                svg: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    {/* Sombra del círculo */}
                    <circle cx="24" cy="25" r="21" fill="#1A202C" opacity="0.3" />

                    {/* Círculo principal */}
                    <circle cx="24" cy="24" r="21" fill="#2D3748" />

                    {/* Logo WhatsApp simplificado y elegante */}
                    <path d="M24 10C16.27 10 10 16.27 10 24C10 26.65 10.81 29.11 12.2 31.2L10 38L17.05 35.85C19.05 37.1 21.45 38 24 38C31.73 38 38 31.73 38 24C38 16.27 31.73 10 24 10Z" fill="white" />

                    {/* Detalle del teléfono dentro */}
                    <path d="M29.2 27.9C28.9 27.75 27.4 27 27.1 26.9C26.8 26.8 26.6 26.75 26.4 27.05C26.2 27.35 25.65 27.9 25.45 28.1C25.25 28.3 25.05 28.35 24.75 28.2C24.45 28.05 23.45 27.7 22.25 26.65C21.3 25.85 20.65 24.85 20.45 24.55C20.25 24.25 20.43 24.05 20.58 23.9C20.71 23.77 20.88 23.55 21.03 23.35C21.18 23.15 21.23 23 21.28 22.8C21.33 22.6 21.31 22.42 21.23 22.27C21.15 22.12 20.65 20.62 20.45 20.02C20.25 19.45 20.05 19.52 19.87 19.51C19.7 19.5 19.52 19.5 19.34 19.5C19.16 19.5 18.86 19.57 18.56 19.87C18.26 20.17 17.5 20.82 17.5 22.32C17.5 23.82 18.6 25.27 18.75 25.45C18.9 25.63 20.65 28.57 23.45 29.65C24.12 29.95 24.64 30.12 25.05 30.25C25.72 30.47 26.33 30.44 26.81 30.37C27.34 30.29 28.52 29.7 28.78 29.05C29.04 28.4 29.04 27.85 28.96 27.72C28.88 27.59 28.7 27.51 28.4 27.36L29.2 27.9Z" fill="#2D3748" />

                    {/* Brillo sutil */}
                    <ellipse cx="18" cy="16" rx="6" ry="4" fill="white" opacity="0.2" />
                  </svg>
                )
              },
              {
                value: "style2",
                name: "Estilo 2",
                svg: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    {/* Sombra del círculo */}
                    <circle cx="24" cy="25" r="21" fill="#E2E8F0" opacity="0.8" />

                    {/* Círculo principal con borde */}
                    <circle cx="24" cy="24" r="21" fill="white" stroke="#2D3748" strokeWidth="2.5" />

                    {/* Logo WhatsApp negro elegante */}
                    <path d="M24 10C16.27 10 10 16.27 10 24C10 26.65 10.81 29.11 12.2 31.2L10 38L17.05 35.85C19.05 37.1 21.45 38 24 38C31.73 38 38 31.73 38 24C38 16.27 31.73 10 24 10Z" fill="#2D3748" />

                    {/* Detalle del teléfono dentro */}
                    <path d="M29.2 27.9C28.9 27.75 27.4 27 27.1 26.9C26.8 26.8 26.6 26.75 26.4 27.05C26.2 27.35 25.65 27.9 25.45 28.1C25.25 28.3 25.05 28.35 24.75 28.2C24.45 28.05 23.45 27.7 22.25 26.65C21.3 25.85 20.65 24.85 20.45 24.55C20.25 24.25 20.43 24.05 20.58 23.9C20.71 23.77 20.88 23.55 21.03 23.35C21.18 23.15 21.23 23 21.28 22.8C21.33 22.6 21.31 22.42 21.23 22.27C21.15 22.12 20.65 20.62 20.45 20.02C20.25 19.45 20.05 19.52 19.87 19.51C19.7 19.5 19.52 19.5 19.34 19.5C19.16 19.5 18.86 19.57 18.56 19.87C18.26 20.17 17.5 20.82 17.5 22.32C17.5 23.82 18.6 25.27 18.75 25.45C18.9 25.63 20.65 28.57 23.45 29.65C24.12 29.95 24.64 30.12 25.05 30.25C25.72 30.47 26.33 30.44 26.81 30.37C27.34 30.29 28.52 29.7 28.78 29.05C29.04 28.4 29.04 27.85 28.96 27.72C28.88 27.59 28.7 27.51 28.4 27.36L29.2 27.9Z" fill="white" />

                    {/* Brillo interior */}
                    <ellipse cx="18" cy="16" rx="6" ry="4" fill="white" opacity="0.4" />
                  </svg>
                )
              },
              {
                value: "style3",
                name: "Estilo 3",
                svg: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    {/* Sombra del círculo */}
                    <circle cx="24" cy="25" r="21" fill="#E2E8F0" opacity="0.8" />

                    {/* Círculo principal */}
                    <circle cx="24" cy="24" r="21" fill="white" stroke="#2D3748" strokeWidth="2.5" />

                    {/* Líneas de chat elegantes */}
                    <g>
                      {/* Línea 1 - más corta */}
                      <rect x="14" y="16" width="8" height="2.5" rx="1.25" fill="#2D3748" />
                      <rect x="26" y="16" width="8" height="2.5" rx="1.25" fill="#2D3748" />

                      {/* Línea 2 - más larga */}
                      <rect x="14" y="22" width="20" height="2.5" rx="1.25" fill="#2D3748" />

                      {/* Línea 3 - mediana */}
                      <rect x="14" y="28" width="14" height="2.5" rx="1.25" fill="#2D3748" />
                    </g>

                    {/* Brillo sutil */}
                    <ellipse cx="18" cy="14" rx="6" ry="3" fill="white" opacity="0.4" />
                  </svg>
                )
              },
              {
                value: "style4",
                name: "Estilo 4",
                svg: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M8 12C8 9.79086 9.79086 8 12 8H36C38.2091 8 40 9.79086 40 12V28C40 30.2091 38.2091 32 36 32H20L12 40V32C9.79086 32 8 30.2091 8 28V12Z" fill="white" stroke="#2D3748" strokeWidth="2" />
                    <path d="M16 16H20" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24 16H32" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 22H28" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )
              },
              {
                value: "style5",
                name: "Estilo 5",
                svg: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    {/* Sombra del globo para profundidad */}
                    <path d="M9 14C9 11.2386 11.2386 9 14 9H34C36.7614 9 39 11.2386 39 14V24C39 26.7614 36.7614 29 34 29H19L12 35V29C10.3431 29 9 27.6569 9 26V14Z" fill="#E2E8F0" />

                    {/* Globo principal */}
                    <path d="M8 13C8 10.2386 10.2386 8 13 8H33C35.7614 8 38 10.2386 38 13V23C38 25.7614 35.7614 28 33 28H18L11 34V28C9.34315 28 8 26.6569 8 25V13Z" fill="white" stroke="#2D3748" strokeWidth="2" />

                    {/* Tres puntitos elegantes con gradiente y sombra */}
                    <g>
                      {/* Primer punto */}
                      <circle cx="18" cy="18" r="2.5" fill="#2D3748">
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0s" />
                      </circle>
                      <circle cx="18" cy="18" r="1.5" fill="#4A5568" opacity="0.8" />

                      {/* Segundo punto */}
                      <circle cx="24" cy="18" r="2.5" fill="#2D3748">
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                      </circle>
                      <circle cx="24" cy="18" r="1.5" fill="#4A5568" opacity="0.8" />

                      {/* Tercer punto */}
                      <circle cx="30" cy="18" r="2.5" fill="#2D3748">
                        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="1s" />
                      </circle>
                      <circle cx="30" cy="18" r="1.5" fill="#4A5568" opacity="0.8" />
                    </g>

                    {/* Brillo sutil en el globo */}
                    <ellipse cx="20" cy="12" rx="8" ry="3" fill="white" opacity="0.3" />
                  </svg>
                )
              }
            ].map((styleOption) => (
              <button
                key={styleOption.value}
                onClick={() => setButtonStyle(styleOption.value)}
                style={{
                  minWidth: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  border: buttonStyle === styleOption.value ? '3px solid #4f46e5' : '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: buttonStyle === styleOption.value
                    ? '0 4px 12px rgba(79, 70, 229, 0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {styleOption.svg}
                {buttonStyle === styleOption.value && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Logo personalizado con subida de archivo */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🖼️ Logo Personalizado (Opcional)
          </label>

          {/* Área de subida de archivo */}
          <div style={{
            position: 'relative',
            border: '2px dashed #e2e8f0',
            borderRadius: '16px',
            padding: '40px 20px',
            backgroundColor: '#f8fafc',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.backgroundColor = '#f0f9ff';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';

              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                  window.compressAndSetImage(file);

                }
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  window.compressAndSetImage(file);

                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />

            {logoUrl ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0'
                  }}
                />
                <div>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#059669'
                  }}>
                    ✅ Logo optimizado y cargado
                  </p>
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🗑️ Eliminando imagen...');
                      setLogoUrl('');
                    }}
                    onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      zIndex: 1000,  // ← IMPORTANTE: Más alto
                      position: 'relative'  // ← AGREGAR ESTO
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '12px'
                }}>
                  📁
                </div>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  Arrastra tu logo aquí o haz clic para seleccionar
                </p>
                <p style={{
                  margin: '0',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  Cualquier imagen - Se optimizará automáticamente
                </p>
              </div>
            )}
          </div>

          <p style={{
            margin: '8px 0 0 0',
            fontSize: '12px',
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            💡 Tu imagen se comprimirá automáticamente para mejor rendimiento. Formatos: JPG, PNG, GIF, WEBP, etc.
          </p>
        </div>

        {/* Función de compresión de imágenes */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.compressAndSetImage = function(file) {
              // Mostrar indicador de procesamiento
              const originalText = document.querySelector('[style*="Arrastra tu logo"]');
              if (originalText) {
                originalText.innerHTML = '⏳ Procesando imagen...';
              }
              
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              
              img.onload = function() {
                // Configurar tamaño máximo (128x128 para logos)
                const maxSize = 128;
                let { width, height } = img;
                
                // Calcular nuevas dimensiones manteniendo proporción
                if (width > height) {
                  if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                  }
                } else {
                  if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                  }
                }
                
                // Configurar canvas
                canvas.width = width;
                canvas.height = height;
                
                // Dibujar imagen redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a base64 con compresión
                // Empezar con calidad alta y reducir si es necesario
                let quality = 0.8;
                let compressedData;
                
                do {
                  compressedData = canvas.toDataURL('image/jpeg', quality);
                  quality -= 0.1;
                } while (compressedData.length > 40000 && quality > 0.1);
                
                // Si aún es muy grande, intentar con PNG
                if (compressedData.length > 40000) {
                  compressedData = canvas.toDataURL('image/png');
                }
                
                // Si todavía es muy grande, reducir más el tamaño
                if (compressedData.length > 40000) {
                  canvas.width = width * 0.7;
                  canvas.height = height * 0.7;
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  compressedData = canvas.toDataURL('image/jpeg', 0.6);
                }
                
                console.log('📸 Imagen comprimida:', {
                  originalSize: file.size,
                  compressedLength: compressedData.length,
                  dimensions: width + 'x' + height,
                  format: 'JPEG/PNG optimizado'
                });
                
                // Actualizar el estado (necesitamos acceso a setLogoUrl)
                window.dispatchEvent(new CustomEvent('logoCompressed', {
                  detail: { data: compressedData }
                }));
                
                // Restaurar texto original
                setTimeout(() => {
                  if (originalText) {
                    originalText.innerHTML = 'Arrastra tu logo aquí o haz clic para seleccionar';
                  }
                }, 100);
              };
              
              img.onerror = function() {
                alert('❌ Error al procesar la imagen. Por favor, intenta con otra imagen.');
                if (originalText) {
                  originalText.innerHTML = 'Arrastra tu logo aquí o haz clic para seleccionar';
                }
              };
              
              // Crear URL para la imagen
              const reader = new FileReader();
              reader.onload = function(e) {
                img.src = e.target.result;
              };
              reader.readAsDataURL(file);
            };
          `
        }} />

        {/* Event listener para la compresión */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('logoCompressed', function(event) {
              // Esta función se ejecutará cuando la imagen esté comprimida
              // Necesitamos actualizar el estado de React
              const logoData = event.detail.data;
              
              // Simular evento de cambio para actualizar React
              const event2 = new CustomEvent('updateLogo', { detail: logoData });
              document.dispatchEvent(event2);
            });
          `
        }} />

        {/* Hook para escuchar eventos de compresión */}
        {React.useEffect(() => {
          const handleLogoUpdate = (event: any) => {
            setLogoUrl(event.detail);
          };

          document.addEventListener('updateLogo', handleLogoUpdate);

          return () => {
            document.removeEventListener('updateLogo', handleLogoUpdate);
          };
        }, [])}

        {/* Horarios de Athola a a aención */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '16px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🕐 Horarios de Atención
          </label>

          {/* Toggle 24 horas */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '2px solid #e2e8f0'
          }}>
            <input
              type="checkbox"
              id="active24hours"
              checked={isActive24Hours}
              onChange={(e) => setIsActive24Hours(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#6366f1'
              }}
            />
            <label htmlFor="active24hours" style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#0f172a',
              cursor: 'pointer'
            }}>
              🌟 Disponible 24 horas
            </label>
          </div>

          {/* Horarios personalizados */}
          {!isActive24Hours && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  🌅 Hora de Inicio
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#f8fafc',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a'
                }}>
                  🌇 Hora de Fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#f8fafc',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Días de la semana */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              📅 Días Activos
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '8px'
            }}>
              {[
                { value: 'monday', name: 'Lunes', short: 'LUN' },
                { value: 'tuesday', name: 'Martes', short: 'MAR' },
                { value: 'wednesday', name: 'Miércoles', short: 'MIE' },
                { value: 'thursday', name: 'Jueves', short: 'JUE' },
                { value: 'friday', name: 'Viernes', short: 'VIE' },
                { value: 'saturday', name: 'Sábado', short: 'SAB' },
                { value: 'sunday', name: 'Domingo', short: 'DOM' }
              ].map((day) => {
                const isSelected = activeDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => {
                      const daysArray = activeDays.split(',').filter(d => d);
                      if (isSelected) {
                        const newDays = daysArray.filter(d => d !== day.value);
                        setActiveDays(newDays.join(','));
                      } else {
                        daysArray.push(day.value);
                        setActiveDays(daysArray.join(','));
                      }
                    }}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#6366f1' : 'white',
                      color: isSelected ? 'white' : '#0f172a',
                      border: isSelected ? '2px solid #6366f1' : '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '12px',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📍 Posición del Botón
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 24px',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '16px',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.3s ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 1rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="top-left">Esquina Superior Izquierda</option>
            <option value="bottom-left">Esquina Inferior Izquierda</option>
            <option value="bottom-right">Esquina Inferior Derecha</option>
            <option value="top-right">Esquina Superior Derecha</option>
          </select>
        </div>

        {/* Color */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🎨 Color del Botón
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '16px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '2px solid #e2e8f0'
          }}>
            {[
              { value: "#25D366", name: "Verde WhatsApp" },
              { value: "#6366f1", name: "Índigo" },
              { value: "#ec4899", name: "Rosa" },
              { value: "#f59e0b", name: "Ámbar" },
              { value: "#8b5cf6", name: "Púrpura" },
              { value: "#0f172a", name: "Gris Oscuro" }
            ].map((colorOption) => (
              <button
                key={colorOption.value}
                onClick={() => setColor(colorOption.value)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  backgroundColor: colorOption.value,
                  border: color === colorOption.value ? '4px solid #0f172a' : '2px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: color === colorOption.value ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: color === colorOption.value
                    ? '0 8px 25px rgba(15, 23, 42, 0.3)'
                    : '0 4px 15px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
                title={colorOption.name}
              >
                {color === colorOption.value && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: colorOption.value === '#f59e0b' || colorOption.value === '#25D366' ? '#000' : '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
          <p style={{
            margin: '12px 0 0 0',
            fontSize: '14px',
            color: '#64748b',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Seleccionado: {color === "#25D366" ? "Verde WhatsApp" :
              color === "#6366f1" ? "Índigo" :
                color === "#ec4899" ? "Rosa" :
                  color === "#f59e0b" ? "Ámbar" :
                    color === "#8b5cf6" ? "Púrpura" : "Gris Oscuro"}
          </p>
        </div>

        {/* Icono */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🎯 Icono del Botón
          </label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 24px',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '16px',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.3s ease',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 1rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="💬">💬 Mensaje</option>
            <option value="📱">📱 Teléfono</option>
            <option value="🚀">🚀 Cohete</option>
            <option value="💚">💚 Corazón Verde</option>
            <option value="⚡">⚡ Rayo</option>
            <option value="🔥">🔥 Fuego</option>
            <option value="💎">💎 Diamante</option>
            <option value="🎯">🎯 Diana</option>
          </select>
        </div>

        {/* Número WhatsApp */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📞 Número de WhatsApp
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{
                padding: '18px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '16px',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontWeight: '500',
                outline: 'none',
                minWidth: '160px',
                appearance: 'none'
              }}
            >
              <option value="51">🇵🇪 +51 Perú</option>
              <option value="1">🇺🇸 +1 EE.UU.</option>
              <option value="52">🇲🇽 +52 México</option>
              <option value="54">🇦🇷 +54 Argentina</option>
              <option value="55">🇧🇷 +55 Brasil</option>
              <option value="57">🇨🇴 +57 Colombia</option>
              <option value="56">🇨🇱 +56 Chile</option>
              <option value="58">🇻🇪 +58 Venezuela</option>
              <option value="34">🇪🇸 +34 España</option>
            </select>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="999 999 999"
              style={{
                flex: 1,
                padding: '18px 24px',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '16px',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Mensaje */}
        <div style={{ marginBottom: '40px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '700',
            color: '#0f172a',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            💬 Mensaje Inicial
          </label>
          <textarea
            value={startMessage}
            onChange={(e) => setStartMessage(e.target.value)}
            placeholder="Escribe tu mensaje personalizado..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '18px 24px',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '16px',
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              fontWeight: '500',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {/* Botón actualizado con animaciones */}
        <button
          onClick={createButton}
          disabled={isSubmitting || isSuccess}
          style={{
            width: '100%',
            padding: '20px 32px',
            background: isSubmitting
              ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
              : hasError
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : isSuccess
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: (isSubmitting || isSuccess) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isSuccess
              ? '0 10px 30px rgba(16, 185, 129, 0.4)'
              : hasError
                ? '0 10px 30px rgba(239, 68, 68, 0.4)'
                : '0 10px 30px rgba(99, 102, 241, 0.4)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Contenido del botón */}
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
            zIndex: 2
          }}>
            {isSubmitting && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}

            {isSuccess && (
              <div style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '6px',
                  borderLeft: '2px solid white',
                  borderBottom: '2px solid white',
                  transform: 'rotate(-45deg)',
                  animation: 'checkmark 0.5s ease-in-out'
                }}></div>
              </div>
            )}

            {!isSubmitting && !isSuccess && !hasError && '✨'}
            {hasError && '❌'}

            <span>
              {isSubmitting
                ? 'Guardando configuración...'
                : hasError
                  ? 'Error - Intentar de nuevo'
                  : isSuccess
                    ? '¡Guardado! Redirigiendo...'
                    : 'Crear Botón WhatsApp'
              }
            </span>
          </span>

          {/* Animación de progreso para estado de éxito */}
          {isSuccess && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: 'rgba(255, 255, 255, 0.2)',
              animation: 'progress 2s linear forwards',
              borderRadius: '20px'
            }}></div>
          )}
        </button>

        {/* CSS Animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes checkmark {
              0% { width: 0; height: 0; }
              50% { width: 0; height: 6px; }
              100% { width: 12px; height: 6px; }
            }
            
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          `
        }} />

        {/* Mensaje de éxito con contador */}
        {isSuccess && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '16px',
            textAlign: 'center',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
              animation: 'bounce 1s ease-in-out infinite'
            }}>
              🎉
            </div>

            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              ¡Configuración guardada exitosamente!
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                Redirigiendo a Integraciones de Aplicaciones...
              </span>
            </div>

            {fetcher.data?.shopInfo && (
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                📍 Tienda: {fetcher.data.shopInfo.domain}
              </div>
            )}
          </div>
        )}

        {/* Estilos CSS adicionales */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          `
        }} />

        {/* Mensaje de error */}
        {hasError && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            ❌ Error al guardar: {
              Array.isArray(fetcher.data?.details)
                ? fetcher.data.details.map((error: any, index: number) => (
                  <div key={index} style={{ margin: '4px 0' }}>
                    {error.message || JSON.stringify(error)}
                  </div>
                ))
                : (fetcher.data?.details || 'Error desconocido')
            }
          </div>
        )}

        {/* Vista previa mejorada */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#0f172a'
          }}>
            👀 Vista Previa de la Configuración
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <div><strong>Teléfono:</strong> +{countryCode}{phoneNumber}</div>
            <div><strong>Posición:</strong> {position}</div>
            <div><strong>Color:</strong> {color}</div>
            <div><strong>Icono:</strong> {icon}</div>
            <div><strong>Estilo:</strong> {buttonStyle}</div>
            <div><strong>Horario:</strong> {isActive24Hours ? '24 horas' : `${startTime} - ${endTime}`}</div>
            <div><strong>Días:</strong> {activeDays.split(',').length} días seleccionados</div>
            {logoUrl && <div><strong>Logo:</strong> Personalizado</div>}
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Mensaje:</strong> {startMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}