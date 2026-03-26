import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import "./index.css";
import App from "./App";
import { getRecaptchaSiteKey } from "./utils/recaptcha";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={getRecaptchaSiteKey()}>
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>
);
