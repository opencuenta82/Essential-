import { useEffect } from "react";
import { useFetcher, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
  Icon,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Rojo", "Naranja", "Amarillo", "Verde"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `Tabla de Snowboard ${color}`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Producto creado exitosamente");
    }
  }, [productId, shopify]);

  const goToWhatsAppCreator = () => navigate("/confgWhatsapp");

  return (
    <Page>
      <TitleBar title="Essential WhatsApp Widget">
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h1" variant="heading2xl" tone="success">
                      🚀 ¡Bienvenido a Essential WhatsApp Widget!
                    </Text>
                    <Badge tone="success" size="large">Nuevo</Badge>
                  </InlineStack>
                  <Text variant="bodyLg" as="p" tone="subdued">
                    La aplicación más completa para integrar WhatsApp en tu tienda Shopify. 
                    Aumenta las conversiones con botones personalizables, horarios inteligentes 
                    y diseños profesionales que se adaptan perfectamente a tu marca.
                  </Text>
                </BlockStack>

                {/* Sección principal con botón destacado - AZUL Y NEGRO */}
                <Card sectioned>
                  <BlockStack gap="600" align="center">
                    <div style={{ 
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                      borderRadius: '24px',
                      padding: '60px 40px',
                      textAlign: 'center',
                      color: 'white',
                      boxShadow: '0 20px 60px rgba(15, 52, 96, 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {/* Elementos decorativos de fondo */}
                      <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '150px',
                        height: '150px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        left: '-30px',
                        width: '100px',
                        height: '100px',
                        background: 'rgba(147, 197, 253, 0.1)',
                        borderRadius: '50%',
                        filter: 'blur(30px)'
                      }}></div>
                      
                      {/* Icono grande */}
                      <div style={{
                        fontSize: '64px',
                        marginBottom: '24px',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                        animation: 'float 3s ease-in-out infinite'
                      }}>
                        💼
                      </div>
                      
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <Text as="h2" variant="heading2xl" tone="text-inverse" style={{ 
                          fontSize: '42px', 
                          fontWeight: '800',
                          marginBottom: '20px',
                          textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                          lineHeight: '1.2'
                        }}>
                          Domina Tu Mercado Digital
                        </Text>
                        <Text variant="headingLg" tone="text-inverse" as="p" style={{ 
                          margin: '20px 0 150px 0',
                          fontSize: '24px',
                          fontWeight: '400',
                          opacity: '0.95',
                          maxWidth: '600px'
                        }}>
                          Herramientas profesionales que convierten visitantes en clientes
                        </Text>
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '45px',
                          padding: '20px',
                          display: 'inline-block',
                          backdropFilter: 'blur(20px)',
                          border: '4px solid rgba(59, 130, 246, 0.4)',
                          marginTop: '60px'
                        }}>
                          <Button
                            variant="monochromePlain"
                            size="large"
                            onClick={goToWhatsAppCreator}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
                              color: '#ffffff',
                              fontWeight: '900',
                              fontSize: '34px',
                              padding: '50px 100px',
                              borderRadius: '30px',
                              boxShadow: '0 15px 50px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(0,0,0,0.2)',
                              border: 'none',
                              transition: 'all 0.5s ease',
                              cursor: 'pointer',
                              minWidth: '600px',
                              minHeight: '120px',
                              textTransform: 'none',
                              letterSpacing: '1px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textShadow: '0 3px 10px rgba(0,0,0,0.4)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-8px) scale(1.06)';
                              e.target.style.boxShadow = '0 25px 80px rgba(59, 130, 246, 0.7), 0 0 0 4px rgba(0,0,0,0.3)';
                              e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0) scale(1)';
                              e.target.style.boxShadow = '0 15px 50px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(0,0,0,0.2)';
                              e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)';
                            }}
                          >
                            ⚡ Crear Tu Botón de WhatsApp Aquí
                          </Button>
                        </div>
                      </div>
                    </div>
                  </BlockStack>
                </Card>

                {/* CSS para animaciones */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-10px); }
                    }
                    
                    @keyframes glow {
                      0%, 100% { box-shadow: 0 20px 60px rgba(37, 211, 102, 0.4); }
                      50% { box-shadow: 0 25px 70px rgba(37, 211, 102, 0.6); }
                    }
                  `
                }} />

                {/* Características principales */}
                <BlockStack gap="300">
                  <Text as="h3" variant="headingLg">
                    ✨ Características Principales
                  </Text>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <Card>
                      <BlockStack gap="200">
                        <div style={{ fontSize: '32px' }}>🎨</div>
                        <Text as="h4" variant="headingMd">Diseños Personalizables</Text>
                        <Text variant="bodyMd">
                          5 estilos únicos, colores personalizados y logos de tu marca
                        </Text>
                      </BlockStack>
                    </Card>
                    <Card>
                      <BlockStack gap="200">
                        <div style={{ fontSize: '32px' }}>⏰</div>
                        <Text as="h4" variant="headingMd">Horarios Inteligentes</Text>
                        <Text variant="bodyMd">
                          Configura horarios de atención y días específicos
                        </Text>
                      </BlockStack>
                    </Card>
                    <Card>
                      <BlockStack gap="200">
                        <div style={{ fontSize: '32px' }}>📱</div>
                        <Text as="h4" variant="headingMd">100% Responsive</Text>
                        <Text variant="bodyMd">
                          Funciona perfectamente en móviles, tablets y desktop
                        </Text>
                      </BlockStack>
                    </Card>
                  </div>
                </BlockStack>

              
              </BlockStack>
            </Card>
          </Layout.Section>
       
        </Layout>
      </BlockStack>
    </Page>
  );
}