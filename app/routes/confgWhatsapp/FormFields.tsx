import * as React from "react";
import { COLOR_OPTIONS, COUNTRY_OPTIONS, ICON_OPTIONS, POSITION_OPTIONS, WEEKDAYS } from "./constants";
import { BUTTON_STYLES } from "./buttonStyles";

interface FormFieldsProps {
  position: string;
  setPosition: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  icon: string;
  setIcon: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  startMessage: string;
  setStartMessage: (value: string) => void;
  buttonStyle: string;
  setButtonStyle: (value: string) => void;
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  isActive24Hours: boolean;
  setIsActive24Hours: (value: boolean) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  activeDays: string;
  setActiveDays: (value: string) => void;
}

export function FormFields({
  position,
  setPosition,
  color,
  setColor,
  icon,
  setIcon,
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  startMessage,
  setStartMessage,
  buttonStyle,
  setButtonStyle,
  logoUrl,
  setLogoUrl,
  isActive24Hours,
  setIsActive24Hours,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  activeDays,
  setActiveDays
}: FormFieldsProps) {
  return (
    <>
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
          {BUTTON_STYLES.map((styleOption) => (
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

      {/* Logo personalizado */}
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
                    zIndex: 1000,
                    position: 'relative'
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
          💡 Tu imagen se comprimirá automáticamente para mejor rendimiento.
        </p>
      </div>

      {/* Horarios de Atención */}
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
            {WEEKDAYS.map((day) => {
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

      {/* Posición del Botón */}
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
          {POSITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Color del Botón */}
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
          {COLOR_OPTIONS.map((colorOption) => (
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
          Seleccionado: {COLOR_OPTIONS.find(c => c.value === color)?.name || 'Personalizado'}
        </p>
      </div>

      {/* Icono del Botón */}
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
          {ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
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
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
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

      {/* Mensaje Inicial */}
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
    </>
  );
}