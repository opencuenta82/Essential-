import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.login(request); 

  return null;
};
