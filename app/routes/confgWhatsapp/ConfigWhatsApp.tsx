import * as React from "react";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { DEFAULT_FORM_VALUES } from "./constants";
import { validateForm } from "./validation";
import { convertTo24Hour } from "./timeUtils";
import { FormFields } from "./FormFields";
import { StatusMessages } from "./StatusMessages";
import { setupImageCompression } from "./imageUtils";

declare global {
  interface Window {
    compressAndSetImage: (file: File) => void;
  }
}

export default function ConfigWhatsApp() {
  const navigate = useNavigate();
  const fetcher = useFetcher<any>();

  // Estados del formulario
  const [position, setPosition] = useState(DEFAULT_FORM_VALUES.position);
  const [color, setColor] = useState(DEFAULT_FORM_VALUES.color);
  const [icon, setIcon] = useState(DEFAULT_FORM_VALUES.icon);
  const [countryCode, setCountryCode] = useState(DEFAULT_FORM_VALUES.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(DEFAULT_FORM_VALUES.phoneNumber);
  const [startMessage, setStartMessage] = useState(DEFAULT_FORM_VALUES.startMessage);
  const [buttonStyle, setButtonStyle] = useState(DEFAULT_FORM_VALUES.buttonStyle);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_FORM_VALUES.logoUrl);
  const [isActive24Hours, setIsActive24Hours] = useState(DEFAULT_FORM_VALUES.isActive24Hours);
  const [startTime, setStartTime] = useState(DEFAULT_FORM_VALUES.startTime);
  const [endTime, setEndTime] = useState(DEFAULT_FORM_VALUES.endTime);
  const [activeDays, setActiveDays] = useState(DEFAULT_FORM_VALUES.activeDays);

  // Configurar script de compresión de imágenes
  React.useEffect(() => {
    setupImageCompression();
  }, []);

  const createButton = async () => {
    // Validar formulario
    const validation = validateForm({
      phoneNumber,
      startMessage,
      countryCode,
      logoUrl,
      color
    });

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    // Resetear fetcher si hay datos previos
    if (fetcher.data?.success) {
      fetcher.data = undefined;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append("phoneWithCode", countryCode + phoneNumber);
    formData.append("startMessage", startMessage);
    formData.append("position", position);
    formData.append("color", color);
    formData.append("icon", icon);
    formData.append("buttonStyle", buttonStyle);
    formData.append("logoUrl", logoUrl);
    formData.append("activeHours", isActive24Hours ? "24hours" : "custom");
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
      startTime: convertTo24Hour(startTime),
      endTime: convertTo24Hour(endTime),
      isActive24Hours,
      activeDays
    });

    fetcher.submit(formData, { method: "POST" });
  };

  // Efecto para redirección exitosa
  React.useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.shopInfo?.domain) {
      console.log("✅ Datos recibidos, iniciando redirección...");

      const shopDomain = fetcher.data.shopInfo.domain;
      const shopName = shopDomain.replace('.myshopify.com', '');
      const themeEditorUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps`;

      console.log("🔗 URL construida:", themeEditorUrl);

      const redirectTimeout = setTimeout(() => {
        console.log("🚀 Ejecutando redirección...");
        window.open(themeEditorUrl, '_blank');

        setTimeout(() => {
          console.log("🔄 Reseteando formulario...");
          window.location.reload();
        }, 1000);
      }, 2000);

      return () => clearTimeout(redirectTimeout);
    }
  }, [fetcher.data]);

  // Efecto para resetear formulario
  React.useEffect(() => {
    if (fetcher.data?.success) {
      setTimeout(() => {
        setPosition(DEFAULT_FORM_VALUES.position);
        setColor(DEFAULT_FORM_VALUES.color);
        setIcon(DEFAULT_FORM_VALUES.icon);
        setCountryCode(DEFAULT_FORM_VALUES.countryCode);
        setPhoneNumber(DEFAULT_FORM_VALUES.phoneNumber);
        setStartMessage(DEFAULT_FORM_VALUES.startMessage);
        setButtonStyle(DEFAULT_FORM_VALUES.buttonStyle);
        setLogoUrl(DEFAULT_FORM_VALUES.logoUrl);
        setIsActive24Hours(DEFAULT_FORM_VALUES.isActive24Hours);
        setStartTime(DEFAULT_FORM_VALUES.startTime);
        setEndTime(DEFAULT_FORM_VALUES.endTime);
        setActiveDays(DEFAULT_FORM_VALUES.activeDays);

        console.log("🔄 Formulario reseteado correctamente");
      }, 3000);
    }
  }, [fetcher.data?.success]);

  // Hook para escuchar eventos de compresión de imagen
  React.useEffect(() => {
    const handleLogoUpdate = (event: any) => {
      setLogoUrl(event.detail);
    };

    document.addEventListener('updateLogo', handleLogoUpdate);

    return () => {
      document.removeEventListener('updateLogo', handleLogoUpdate);
    };
  }, []);

  // Estados de loading
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
        {/* Campos del formulario */}
        <FormFields
          // Estados del formulario
          position={position}
          setPosition={setPosition}
          color={color}
          setColor={setColor}
          icon={icon}
          setIcon={setIcon}
          countryCode={countryCode}
          setCountryCode={setCountryCode}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          startMessage={startMessage}
          setStartMessage={setStartMessage}
          buttonStyle={buttonStyle}
          setButtonStyle={setButtonStyle}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          isActive24Hours={isActive24Hours}
          setIsActive24Hours={setIsActive24Hours}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          activeDays={activeDays}
          setActiveDays={setActiveDays}
        />

        {/* Botón principal */}
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
            
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          `
        }} />

        {/* Mensajes de estado */}
        <StatusMessages
          isSuccess={isSuccess}
          hasError={hasError}
          fetcher={fetcher}
        />

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