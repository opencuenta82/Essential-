import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  // 🔧 CORRECCIÓN: Usar shopify.login() en lugar de authenticate.admin()
  // en la ruta de login según la documentación oficial
  await authenticate.login(request);

  return null;
};