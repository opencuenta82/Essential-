import { ActionFunctionArgs } from "@remix-run/node";
import { actionHandler } from "./configAction";
import ConfigWhatsApp from "./ConfigWhatsApp";

// Re-exportar la función action principal
export const action = actionHandler;

// Exportar el componente principal
export default ConfigWhatsApp;