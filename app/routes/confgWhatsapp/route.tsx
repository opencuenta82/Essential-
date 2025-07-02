import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

// API ACTION para guardar configuración
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
    const config = {
      phoneNumber: formData.get("phoneWithCode"),
      message: formData.get("startMessage"),
      position: formData.get("position"),
      color: formData.get("color"),
      icon: formData.get("icon"),
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
      console.log("⚠️ GraphQL falló, usando método alternativo:", graphqlError.message);
      
      // MÉTODO 2: Usar la información de la sesión
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
    ];

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

    // Verificación adicional: Leer los metafields guardados
    try {
      const verificationQuery = await admin.graphql(`
        query {
          shop {
            metafields(namespace: "whatsapp_widget", first: 10) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
      `);

      const verificationResult = await verificationQuery.json();
      console.log("🔍 Verificación - Metafields en la tienda:", verificationResult.data?.shop?.metafields?.edges);

      return json({ 
        success: true, 
        message: "Configuración guardada exitosamente",
        config,
        savedMetafields,
        verification: verificationResult.data?.shop?.metafields?.edges,
        shopInfo: {
          domain: session.shop,
          shopId: shopId
        }
      });
    } catch (verificationError) {
      console.log("⚠️ Error en verificación, pero metafields guardados:", verificationError.message);
      
      return json({ 
        success: true, 
        message: "Configuración guardada exitosamente",
        config,
        savedMetafields,
        shopInfo: {
          domain: session.shop,
          shopId: shopId
        },
        warning: "No se pudo verificar la guardada, pero los metafields se crearon"
      });
    }
    
  } catch (error) {
    console.error("💥 Error guardando configuración:", error);
    console.error("Stack trace:", error.stack);
    
    return json({ 
      success: false, 
      error: "Error al guardar la configuración",
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export default function ConfigWhatsApp() {
  const navigate = useNavigate();
  
  // Estado para los campos del formulario
  const [position, setPosition] = useState("bottom-right");
  const [color, setColor] = useState("#25D366");
  const [icon, setIcon] = useState("💬");
  const [countryCode, setCountryCode] = useState("51");
  const [phoneNumber, setPhoneNumber] = useState("999999999");
  const [startMessage, setStartMessage] = useState("¡Hola! Me interesa tu producto");
  const fetcher = useFetcher();

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

    console.log("📤 Enviando datos:", {
      phone: countryCode + phoneNumber,
      message: startMessage,
      position,
      color,
      icon
    });

    // Enviar a la API (misma ruta)
    fetcher.submit(formData, {
      method: "POST"
    });
  };

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
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '50px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>

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

        {/* Botón actualizado */}
        <button 
          onClick={createButton}
          disabled={isSubmitting}
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
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          {isSubmitting 
            ? '⏳ Guardando...' 
            : hasError
              ? '❌ Error - Intentar de nuevo'
              : isSuccess 
                ? '✅ ¡Configuración guardada!'
                : '✨ Crear Botón WhatsApp ✨'
          }
        </button>

        {/* Mensaje de éxito */}
        {isSuccess && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            🎉 ¡Configuración guardada exitosamente! Los datos ya están disponibles en tu tema.
            <br />
            <small style={{ opacity: 0.9 }}>
              Ve al editor de temas y agrega el "WhatsApp Widget" como App Block
            </small>
            {fetcher.data?.shopInfo && (
              <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                Tienda: {fetcher.data.shopInfo.domain}
              </div>
            )}
          </div>
        )}

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
            ❌ Error al guardar: {fetcher.data?.details || 'Error desconocido'}
          </div>
        )}

        {/* Vista previa */}
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
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Mensaje:</strong> {startMessage}
            </div>
          </div>
        </div>

        {/* Debug información (solo en HOLA desarrollo) */}
        {fetcher.data && (
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              🔍 Debug Information
            </summary>
            <pre style={{
              background: '#f1f5f9',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              overflow: 'auto',
              marginTop: '8px'
            }}>
              {JSON.stringify(fetcher.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}