import { Page, Card, Text, TextField, Button, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

export default function WhatsAppConfig() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("¡Hola! ¿En qué puedo ayudarte?");

  return (
    <Page>
      <TitleBar title="WhatsApp Config" />
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            botton de WhatsApp
          </Text>
          
          
        </BlockStack>
      </Card>
    </Page>
  );
}