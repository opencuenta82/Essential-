import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

// MOCKEAR Shopify globalmente
if (typeof window !== 'undefined' && !window.shopify) {
  window.shopify = {
    environment: 'development',
    config: { shop: 'demo.myshopify.com' }
  };
}

// IMPORTAR el componente de app._index.jsx
import AppIndex from "../app._index";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        {/* MENSAJE DE DEMO */}
        <div style={{
          backgroundColor: '#f0f8ff',
          border: '2px solid #4a90e2',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#4a90e2', marginBottom: '10px' }}>
            🚀 Vista Previa de Essential WhatsApp Widget
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Esta es una <strong>demostración</strong> de la interfaz de Essential. 
            Los errores de conexión son normales ya que no está conectado a una tienda real.
          </p>
          <p style={{ 
            backgroundColor: '#e8f4fd', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            💡 <strong>Para comerciantes:</strong> Instala Essential en tu tienda Shopify 
            para acceder a la funcionalidad completa sin errores.
          </p>
        </div>

        {/* INTERFAZ COMPLETA */}
        <AppProvider 
          i18n={{
            Polaris: {
              Common: {
                checkbox: "checkbox",
                cancel: "Cancel",
                save: "Save"
              }
            }
          }}
        >
          <AppIndex />
        </AppProvider>
      </div>
    </div>
  );
}