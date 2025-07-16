import * as React from "react";

interface StatusMessagesProps {
  isSuccess: boolean;
  hasError: boolean;
  fetcher: any;
}

export function StatusMessages({ isSuccess, hasError, fetcher }: StatusMessagesProps) {
  return (
    <>
      {/* Mensaje de éxito */}
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
    </>
  );
}