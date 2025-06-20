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

  // Función para obtener estilos de posición
  const getPositionStyles = (position) => {
    const baseStyles = {
      position: 'fixed',
      backgroundColor: '#25D366',
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Solo mostrar el último botón */}
      {lastButton && (
        <>
          <button 
            style={getPositionStyles(lastButton.position)}
            onClick={() => openWhatsApp(lastButton.phone, lastButton.message)}
          >
            💬 WhatsApp
          </button>
          
          {/* Botón eliminar en esquina opuesta */}
          <button 
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              backgroundColor: '#d72c0d',
              color: 'white',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              zIndex: 1001
            }}
            onClick={() => deleteButton(lastButton.id)}
          >
            🗑️ Eliminar
          </button>
        </>
      )}
    </div>
  );
}