import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { initAnalytics } from "./lib/analytics";
import { reportWebVitals } from "./lib/web-vitals";

initAnalytics();

reportWebVitals();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
