import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorOverlay, NotFoundOverlay } from "./components/overlay";
import { Providers } from "./components/providers";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
  scrollRestoration: true,
  defaultErrorComponent: ErrorOverlay,
  defaultNotFoundComponent: NotFoundOverlay,
  basepath: import.meta.env.VITE_BASE ?? "/",
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
}
