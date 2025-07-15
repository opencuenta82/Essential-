import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Divider,
  List,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  // Headers de seguridad
  const responseHeaders = new Headers();
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  
  if (shop) {
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const cspValue = `frame-ancestors https://${shopDomain} https://admin.shopify.com`;
    responseHeaders.set('Content-Security-Policy', cspValue);
  } else {
    responseHeaders.set('Content-Security-Policy', "frame-ancestors 'none'");
  }
  
  return json(null, { headers: responseHeaders });
};

export default function PrivacyPolicy() {
  return (
    <Page 
      title="Privacy Policy" 
      subtitle="Last updated: January 2025"
      backAction={{ content: "Back", url: "/" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingLg">
                WhatsApp Widget Privacy Policy
              </Text>
              
              <Divider />
              
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  1. Information We Collect
                </Text>
                <Text variant="bodyMd" as="p">
                  Our WhatsApp Widget app collects minimal information necessary to provide our service:
                </Text>
                <List>
                  <List.Item>
                    <strong>Store Information:</strong> Your Shopify store domain and basic store settings to configure the widget properly.
                  </List.Item>
                  <List.Item>
                    <strong>Widget Configuration:</strong> Your customization preferences including colors, position, business hours, and WhatsApp number.
                  </List.Item>
                  <List.Item>
                    <strong>Usage Analytics:</strong> Basic usage statistics to improve our service (anonymized data only).
                  </List.Item>
                </List>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  2. How We Use Your Information
                </Text>
                <Text variant="bodyMd" as="p">
                  We use the collected information solely to:
                </Text>
                <List>
                  <List.Item>Provide and maintain the WhatsApp widget functionality</List.Item>
                  <List.Item>Store your widget configuration preferences</List.Item>
                  <List.Item>Improve our app's performance and features</List.Item>
                  <List.Item>Provide customer support when needed</List.Item>
                </List>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  3. Information We Do NOT Collect
                </Text>
                <Text variant="bodyMd" as="p">
                  We want to be clear about what we don't collect:
                </Text>
                <List>
                  <List.Item>Customer personal information (names, emails, addresses)</List.Item>
                  <List.Item>Product information or inventory data</List.Item>
                  <List.Item>Order information or transaction details</List.Item>
                  <List.Item>WhatsApp conversation content</List.Item>
                  <List.Item>Payment or financial information</List.Item>
                </List>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  4. Data Storage and Security
                </Text>
                <Text variant="bodyMd" as="p">
                  Your data security is important to us:
                </Text>
                <List>
                  <List.Item>All data is stored securely using industry-standard encryption</List.Item>
                  <List.Item>We use secure HTTPS connections for all data transmission</List.Item>
                  <List.Item>Access to your data is strictly limited to authorized personnel</List.Item>
                  <List.Item>We regularly update our security measures</List.Item>
                </List>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  5. Data Sharing and Third Parties
                </Text>
                <Text variant="bodyMd" as="p">
                  We do not sell, trade, or otherwise transfer your information to third parties. The only exception is:
                </Text>
                <List>
                  <List.Item>Shopify platform (as required for app functionality)</List.Item>
                  <List.Item>Cloud hosting providers (with strict data protection agreements)</List.Item>
                  <List.Item>When required by law or legal process</List.Item>
                </List>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  6. GDPR and Data Rights
                </Text>
                <Text variant="bodyMd" as="p">
                  If you are a European resident, you have the right to:
                </Text>
                <List>
                  <List.Item><strong>Access:</strong> Request a copy of your personal data</List.Item>
                  <List.Item><strong>Rectification:</strong> Request correction of inaccurate data</List.Item>
                  <List.Item><strong>Erasure:</strong> Request deletion of your personal data</List.Item>
                  <List.Item><strong>Portability:</strong> Request transfer of your data</List.Item>
                  <List.Item><strong>Objection:</strong> Object to processing of your data</List.Item>
                </List>
                <Text variant="bodyMd" as="p">
                  To exercise these rights, contact us at <strong>privacy@yourapp.com</strong>
                </Text>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  7. Data Retention
                </Text>
                <Text variant="bodyMd" as="p">
                  We retain your information only as long as necessary to provide our services. When you uninstall our app, we automatically delete all associated data within 30 days.
                </Text>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  8. Children's Privacy
                </Text>
                <Text variant="bodyMd" as="p">
                  Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </Text>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  9. Changes to This Policy
                </Text>
                <Text variant="bodyMd" as="p">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </Text>
              </BlockStack>

              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  10. Contact Information
                </Text>
                <Text variant="bodyMd" as="p">
                  If you have any questions about this Privacy Policy, please contact us:
                </Text>
                <List>
                  <List.Item><strong>Email:</strong> privacy@yourapp.com</List.Item>
                  <List.Item><strong>Support:</strong> support@yourapp.com</List.Item>
                  <List.Item><strong>Website:</strong> https://yourapp.com</List.Item>
                </List>
              </BlockStack>

              <Divider />
              
              <Text variant="bodyMd" as="p" color="subdued">
                This privacy policy complies with GDPR, CCPA, and Shopify's privacy requirements.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}