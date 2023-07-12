import { createRoot } from "react-dom/client";
import { initI18n } from "./utils/i18nUtils";
import App from "./App";
import "./styles.css";

const container = document.getElementById("app");
const root = createRoot(container);

// Ensure that locales are loaded before rendering the app
initI18n().then(() => {
  root.render(<App />);
});
