import { useState } from "react";
import { useNavigate } from "@remix-run/react";

export default function ConfigWhatsApp() {
  const navigate = useNavigate();
  
  // Estado para los campos del formulario
  const [phone, setPhone] = useState("51999999999");
  const [message, setMessage] = useState("¡Hola! Me interesa tu producto");
  const [position, setPosition] = useState("bottom-right");
  const [color, setColor] = useState("#25D366");
  const [icon, setIcon] = useState("💬");
  const [countryCode, setCountryCode] = useState("51");
  const [phoneNumber, setPhoneNumber] = useState("999999999");
  const [startMessage, setStartMessage] = useState("¡Hola! Me interesa tu producto");

  const createButton = () => {
    const newButton = {
      id: Date.now(),
      phone: phone,
      message: message,
      position: position,
      color: color,
      icon: icon,
      phoneWithCode: countryCode + phoneNumber,
      startMessage: startMessage,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };

    const existingButtons = JSON.parse(localStorage.getItem('whatsappButtons') || '[]');
    const updatedButtons = [...existingButtons, newButton];
    localStorage.setItem('whatsappButtons', JSON.stringify(updatedButtons));
  
  };

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
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
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
                onMouseOver={(e) => {
                  if (color !== colorOption.value) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (color !== colorOption.value) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }
                }}
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
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
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
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em'
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
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
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
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Botón crear */}
        <button 
          onClick={createButton}
          style={{
            width: '100%',
            padding: '20px 32px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
          }}
        >
          ✨ Crear Botón WhatsApp ✨
        </button>
      </div>
    </div>
  );
}