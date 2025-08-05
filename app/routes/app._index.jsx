import { useEffect, useState } from "react";
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
  Modal,
  TextContainer,
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
  const [modalActive, setModalActive] = useState(false);
  
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

  // DETECTAR SI ES DEMO O TIENDA REAL
  const isDemo = () => {
    try {
      if (typeof window !== 'undefined') {
        if (!window.shopify || 
            window.shopify.config?.shop === 'demo.myshopify.com' ||
            !shopify?.config?.shop) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return true;
    }
  };

  // FUNCIÓN PARA MANEJAR EL CLIC DEL BOTÓN
  const handleButtonClick = () => {
    if (isDemo()) {
      setModalActive(true);
    } else {
      navigate("/confgWhatsapp");
    }
  };

  // FUNCIÓN PARA ABRIR SHOPIFY ADMIN
  const openShopifyAdmin = () => {
    window.open('https://accounts.shopify.com', '_blank');
    setModalActive(false);
  };

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
                    <Badge tone={isDemo() ? "attention" : "success"} size="large">
                      {isDemo() ? "Vista Previa" : "Nuevo"}
                    </Badge>
                  </InlineStack>
                  <Text variant="bodyLg" as="p" tone="subdued">
                    La aplicación más completa para integrar WhatsApp en tu tienda Shopify. 
                    Aumenta las conversiones con botones personalizables, horarios inteligentes 
                    y diseños profesionales que se adaptan perfectamente a tu marca.
                  </Text>
                  
                  {/* MENSAJE DE DEMO SI ES NECESARIO */}
                  {isDemo() && (
                    <Card sectioned>
                      <BlockStack gap="200">
                        <Text variant="headingMd" tone="warning">
                          📋 Vista Previa Demo
                        </Text>
                        <Text variant="bodyMd">
                          Esta es una demostración de Essential. Para acceder a la funcionalidad 
                          completa, instala la aplicación en tu tienda Shopify.
                        </Text>
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>

                {/* Sección principal con botón destacado - SIN FONDO BLANCO */}
                <BlockStack gap="100" align="center">
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
                          onClick={handleButtonClick}
                          style={{
                            background: isDemo() ? 
                              'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)' :
                              'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
                            color: '#ffffff',
                            fontWeight: '900',
                            fontSize: '34px',
                            padding: '50px 100px',
                            borderRadius: '30px',
                            boxShadow: isDemo() ?
                              '0 15px 50px rgba(245, 158, 11, 0.5), 0 0 0 3px rgba(0,0,0,0.2)' :
                              '0 15px 50px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(0,0,0,0.2)',
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
                        >
                          {isDemo() ? 
                            '🔑 Iniciar Sesión en Shopify' : 
                            '⚡ Crear Tu Botón de WhatsApp Aquí'
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                </BlockStack>

                {/* MODAL PARA INICIAR SESIÓN */}
                <Modal
                  open={modalActive}
                  onClose={() => setModalActive(false)}
                  title="🚀 Para usar Essential WhatsApp Widget"
                  primaryAction={{
                    content: '🔑 Iniciar Sesión en Shopify',
                    onAction: openShopifyAdmin,
                  }}
                  secondaryActions={[
                    {
                      content: 'Cerrar',
                      onAction: () => setModalActive(false),
                    },
                  ]}
                >
                  <Modal.Section>
                    <TextContainer>
                      <div style={{ 
                        padding: '20px', 
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        margin: '10px 0'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
                        <Text variant="headingMd" as="h3" style={{ marginBottom: '16px' }}>
                          ¡Inicia sesión en tu tienda Shopify!
                        </Text>
                        <Text variant="bodyMd" as="p" style={{ marginBottom: '20px' }}>
                          Esta es una vista previa de Essential. Para acceder a toda la funcionalidad:
                        </Text>
                      </div>
                      
                      <BlockStack gap="300">
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e1e5e9'
                        }}>
                          <div style={{ fontSize: '24px', marginRight: '12px' }}>1️⃣</div>
                          <Text variant="bodyMd">
                            <strong>Inicia sesión</strong> en tu tienda Shopify usando el botón de abajo
                          </Text>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e1e5e9'
                        }}>
                          <div style={{ fontSize: '24px', marginRight: '12px' }}>2️⃣</div>
                          <Text variant="bodyMd">
                            <strong>Busca "Essential"</strong> en tus aplicaciones instaladas
                          </Text>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e1e5e9'
                        }}>
                          <div style={{ fontSize: '24px', marginRight: '12px' }}>3️⃣</div>
                          <Text variant="bodyMd">
                            <strong>¡Configura</strong> tus botones WhatsApp profesionales!
                          </Text>
                        </div>
                      </BlockStack>
                      
                      <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <Text variant="bodyMd" tone="warning">
                          💡 <strong>Nota:</strong> Necesitas tener Essential instalado en tu tienda Shopify
                        </Text>
                      </div>
                    </TextContainer>
                  </Modal.Section>
                </Modal>

                {/* CSS para animaciones */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-10px); }
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