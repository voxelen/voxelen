import { LoadingOverlay } from "@mantine/core";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Layout } from "@/components/layout";
import { MANIFEST } from "@/features/const";
import { useDynamicPWA } from "@/hooks/use-dynamic-pwa";

export const Route = createRootRoute({
  pendingComponent: () => <LoadingOverlay visible />,
  component: () => {
    useDynamicPWA(MANIFEST);

    return (
      <>
        <HeadContent />
        <Layout>
          <Outlet />
        </Layout>
        <Scripts />
      </>
    );
  },
});
