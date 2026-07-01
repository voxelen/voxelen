import { LoadingOverlay } from "@mantine/core";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { ScrollTop } from "@/components/scroll-top";
import { ShortcutsView } from "@/components/shortcuts";
import { MANIFEST } from "@/features/const";
import { useDynamicPWA } from "@/hooks/use-dynamic-pwa";

export const Route = createRootRoute({
  pendingComponent: () => <LoadingOverlay visible />,
  component: () => {
    useDynamicPWA(MANIFEST);

    return (
      <>
        <HeadContent />
        <Outlet />
        <ShortcutsView />
        <ScrollTop />
        <Scripts />
      </>
    );
  },
});
