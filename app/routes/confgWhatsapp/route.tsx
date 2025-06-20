// Archivo: app/routes/app.whatsapp.jsx (archivo plano, NO carpeta)

import { Page, Card, Text, TextField, Button, BlockStack, Select, InlineStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

export default function WhatsAppConfig() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("¡Hola! ¿En qué puedo ayudarte?");
  const [position, setPosition] = useState("bottom-right");
  const [color, setColor] = useState("green");

  const positionOptions = [
    { label: "Abajo Derecha", value: "bottom-right" },
    { label: "Abajo Izquierda", value: "bottom-left" },
    { label: "Centro Derecha", value: "center-right" },
  ];

  const colorOptions = [
    { label: "Verde", value: "green" },
    { label: "Azul", value: "blue" },
    { label: "Rojo", value: "red" },
  ];

  const generateButton = () => {
    console.log("Generar botón:", { phone, message, position, color });
    alert("Botón generado! Revisa la consola");
  };

  return (
    <Page>
      <TitleBar title="WhatsApp Config" />
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Configuración WhatsApp
          </Text>
          
          <TextField
            label="Número de WhatsApp"
            value={phone}
            onChange={setPhone}
            placeholder="+51987654321"
          />

          <TextField
            label="Mensaje de introducción"
            value={message}
            onChange={setMessage}
            multiline
          />

          <InlineStack gap="300">
            <Select
              label="Ubicación del botón"
              options={positionOptions}
              value={position}
              onChange={setPosition}
            />

            <Select
              label="Color del botón"
              options={colorOptions}
              value={color}
              onChange={setColor}
            />
          </InlineStack>

          <InlineStack align="end">
            <Button variant="primary" onClick={generateButton}>
              Generar Botón
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </Page>
  );
}