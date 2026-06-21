import { LoadingOverlay } from "@mantine/core";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Providers } from "@/components/providers";
import { MANIFEST } from "@/features/const";
import { useDynamicPWA } from "@/hooks/use-dynamic-pwa";

export const Route = createRootRoute({
  pendingComponent: () => <LoadingOverlay visible />,
  component: () => {
    useDynamicPWA(MANIFEST);

    return (
      <>
        <HeadContent />
        <Providers>
          <Outlet />
        </Providers>
        <Scripts />
      </>
    );
  },
});
