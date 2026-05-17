import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./App.tsx";
import { Toaster } from "./components/ui/toaster";
import SourceCodeButton from "./components/SourceCodeButton";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
    <SourceCodeButton />
  </StrictMode>,
);
