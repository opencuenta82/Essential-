import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // 🛡️ SECURITY HEADERS - Obtener shop parameter
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // Configurar headers de seguridad
  const headers = {};
  if (shop) {
    headers["Content-Security-Policy"] = 
      `frame-ancestors https://${shop} https://admin.shopify.com`;
  } else {
    headers["Content-Security-Policy"] = "frame-ancestors 'none'";
  }

  const data = { 
    apiKey: process.env.SHOPIFY_API_KEY || "" 
  };

  return json(data, { headers });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu open={true}>
        <Link to="/app" rel="home">
          🏠 Inicio
        </Link>
        <Link to="/confgWhatsapp">
          ⚙️ Configurar WhatsApp
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};