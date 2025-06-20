import { useState } from "react";
import { useNavigate } from "@remix-run/react";

export default function ConfigWhatsApp() {
  const navigate = useNavigate();
  
  // Estado para los campos del formulario
  const [phone, setPhone] = useState("51999999999");
  const [message, setMessage] = useState("¡Hola! Me interesa tu producto");
  const [position, setPosition] = useState("bottom-right");

  const createButton = () => {
    // Crear el botón y guardarlo en localStorage
    const newButton = {
      id: Date.now(),
      phone: phone,
      message: message,
      position: position,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };

    // Obtener botones existentes
    const existingButtons = JSON.parse(localStorage.getItem('whatsappButtons') || '[]');
    
    // Agregar el nuevo botón
    const updatedButtons = [...existingButtons, newButton];
    
    // Guardar en localStorage
    localStorage.setItem('whatsappButtons', JSON.stringify(updatedButtons));
    
    // Redirigir a la página de ver botones
    navigate('/verWhatsapp');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Generador de Botones WhatsApp</h1>
      
      <p style={{ color: '#616161', marginBottom: '20px' }}>
        Configura tu botón de WhatsApp y créalo para verlo en la siguiente página.
      </p>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Ubicacion:
        </label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{
            width: '200px',
            padding: '6px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          <option value="top-left">Arriba</option>
          <option value="bottom-left">Abajo</option>
          <option value="bottom-right">Derecha</option>
          <option value="top-right">Izquierda</option>
        </select>
      </div>

      <button 
        onClick={createButton}
        style={{
          backgroundColor: '#007c89',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ✨ Crear Botón WhatsApp
      </button>

    </div>
  );
}