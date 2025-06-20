import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export default function VerWhatsApp() {
  const [buttons, setButtons] = useState([]);
  const navigate = useNavigate();

  // Cargar botones desde localStorage al cargar la página
  useEffect(() => {
    const savedButtons = JSON.parse(localStorage.getItem('whatsappButtons') || '[]');
    setButtons(savedButtons);
  }, []);

  const openWhatsApp = (phone, message) => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const deleteButton = (id) => {
    const updatedButtons = buttons.filter(btn => btn.id !== id);
    setButtons(updatedButtons);
    localStorage.setItem('whatsappButtons', JSON.stringify(updatedButtons));
  };

  // Función para obtener estilos de posición CON COLOR
  const getPositionStyles = (position, color) => {
    const baseStyles = {
      position: 'fixed',
      backgroundColor: color || '#25D366',
      color: 'white',
      padding: '12px 16px',
      border: 'none',
      borderRadius: '50px',
      fontSize: '14px',
      cursor: 'pointer',
      zIndex: 1000,
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    };

    switch(position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default:
        return { ...baseStyles, bottom: '20px', right: '20px' };
    }
  };

  // Mostrar solo el último botón creado
  const lastButton = buttons[buttons.length - 1];

  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      padding: '20px'
    }}>
      
      {/* Botón volver - diseño bonito */}
      <button
        onClick={() => navigate('/confgWhatsapp')}
        style={{
          position: 'fixed',
          top: '30px',
          left: '30px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 1002,
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.5)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
        }}
      >
        ⬅️ Volver a Configurar
      </button>

      {/* Solo mostrar el último botón CON NUEVOS CAMPOS */}
      {lastButton && (
        <>
          <button
            style={getPositionStyles(lastButton.position, lastButton.color)}
            onClick={() => openWhatsApp(lastButton.phoneWithCode, lastButton.startMessage)}
          >
            {lastButton.icon} WhatsApp
          </button>
          
          {/* Botón eliminar mejorado */}
          <button
            style={{
              position: 'fixed',
              top: '30px',
              right: '30px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              zIndex: 1001,
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => deleteButton(lastButton.id)}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
            }}
          >
            🗑️ Eliminar
          </button>
        </>
      )}
    </div>
  );
}