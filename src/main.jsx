import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FocusTimer from "./FocusTimer";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FocusTimer />
  </StrictMode>
);
