import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/layout";
import { MapView } from "@/features/map-core";

export const Route = createFileRoute("/")({
  component: () => {
    return (
      <Layout>
        <MapView />
      </Layout>
    );
  },
});
