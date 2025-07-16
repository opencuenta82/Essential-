import crypto from "crypto";
import { ActionFunctionArgs } from "@remix-run/node";

export function verifyShopifyWebhook(data: string, hmacHeader: string): boolean {
  const calculated = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(data, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(calculated, 'base64'),
    Buffer.from(hmacHeader, 'base64')
  );
}

export async function gdprWebhookHandler({ request }: ActionFunctionArgs) {
  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
  const topic = request.headers.get("X-Shopify-Topic");

  if (!hmacHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.text();

  if (!verifyShopifyWebhook(body, hmacHeader)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Procesar webhook según el topic
  switch (topic) {
    case "customers/data_request":
    case "customers/redact":
    case "shop/redact":
    case "app/uninstalled":
      console.log(`GDPR webhook received: ${topic}`);
      break;
  }

  return new Response("OK", { status: 200 });
}   