import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import shopify from "./shopify.server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  // 🛡️ SOLUCIÓN OFICIAL DE SHOPIFY - Security Headers automáticos
  // Esto agrega automáticamente los headers Content-Security-Policy requeridos
  // para frame-ancestors según la documentación oficial
  shopify.addDocumentResponseHeaders(request, responseHeaders);

  // Renderizar la aplicación React a string
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  // Configurar el Content-Type
  responseHeaders.set("Content-Type", "text/html");

  // Retornar la respuesta HTML completa
  return new Response("<!DOCTYPE html>" + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}