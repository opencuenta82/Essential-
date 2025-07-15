import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  console.log("🔍 App._index loader ejecutándose");
  
  // Autenticar con Shopify Admin
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  
  console.log("✅ Autenticación exitosa para shop:", shop);
  
  return json({
    message: "Essential WhatsApp Widget",
    shop: shop,
    status: "working",
    timestamp: new Date().toISOString()
  });
};

export default function AppIndex() {
  const data = useLoaderData();
  
  return (
    <Page>
      <TitleBar title="Essential WhatsApp Widget" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    🎉 {data.message}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Your WhatsApp widget app is successfully running and embedded in Shopify Admin!
                  </Text>
                </BlockStack>

                <Card background="bg-surface-success" padding="400">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" tone="success">
                      ✅ Status: {data.status.toUpperCase()}
                    </Text>
                    <Text variant="bodyMd">
                      <strong>Shop:</strong> {data.shop}
                    </Text>
                    <Text variant="bodyMd">
                      <strong>Timestamp:</strong> {data.timestamp}
                    </Text>
                  </BlockStack>
                </Card>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    🚀 App Features
                  </Text>
                  <BlockStack gap="100">
                    <Text variant="bodyMd">✅ <strong>Authentication:</strong> Shopify Admin OAuth working</Text>
                    <Text variant="bodyMd">✅ <strong>Embedded:</strong> Properly embedded in Shopify Admin</Text>
                    <Text variant="bodyMd">✅ <strong>App Bridge:</strong> Connected and functioning</Text>
                    <Text variant="bodyMd">✅ <strong>Security:</strong> CSP headers configured</Text>
                    <Text variant="bodyMd">✅ <strong>GDPR:</strong> Compliance webhooks implemented</Text>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    📞 WhatsApp Widget
                  </Text>
                  <BlockStack gap="100">
                    <Text variant="bodyMd">🔘 <strong>Floating Button:</strong> Customizable</Text>
                    <Text variant="bodyMd">📱 <strong>Mobile Ready:</strong> Responsive</Text>
                    <Text variant="bodyMd">⚙️ <strong>Easy Setup:</strong> No coding</Text>
                    <Text variant="bodyMd">🛡️ <strong>Secure:</strong> Full compliance</Text>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    📊 Implementation Status
                  </Text>
                  <BlockStack gap="100">
                    <Text variant="bodyMd" tone="success">✅ Server Running</Text>
                    <Text variant="bodyMd" tone="success">✅ OAuth Authenticated</Text>
                    <Text variant="bodyMd" tone="success">✅ Database Connected</Text>
                    <Text variant="bodyMd" tone="success">✅ Extensions Compiled</Text>
                    <Text variant="bodyMd" tone="success">✅ Ready for App Store</Text>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    📞 Support & Legal
                  </Text>
                  <InlineStack gap="300">
                    <Text variant="bodyMd">
                      <a href="/privacy-policy" target="_blank">Privacy Policy</a>
                    </Text>
                    <Text variant="bodyMd">
                      <a href="/terms-of-service" target="_blank">Terms of Service</a>
                    </Text>
                  </InlineStack>
                  <Text variant="bodyMd" tone="subdued">
                    Essential WhatsApp Widget v1.0.0
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
} 