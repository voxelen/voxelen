import { ActionIcon, Badge, Card, Center, Group, Skeleton, Stack, Text } from "@mantine/core";
import { BIOMES } from "@repo/shared/constants";
import { Iconify } from "@/components/iconify";
import { useBiomeAt } from "@/features/engine";
import { useMapControls } from "@/features/map-manager";

export const MapView = () => {
  const controls = useMapControls();
  const { data, isPending } = useBiomeAt(controls.values);

  const biome = BIOMES.find((biome) => biome.id === data);
  const { x, z } = controls.coordinates;

  return (
    <Center h="100%" w="100%" p={10}>
      <Card h="100%" w="100%" p={0} pos="relative">
        {isPending ? (
          <Skeleton w="100%" h="100%" />
        ) : (
          <canvas style={{ backgroundColor: biome?.color, width: "100%", height: "100%" }} />
        )}
        <CursorView biome={biome?.label || "loading..."} x={x} z={z} />
        <ZoomControls loading={isPending} />
      </Card>
    </Center>
  );
};

type $CursorView = { biome: string; x: number; z: number };
const CursorView = ({ biome, x, z }: $CursorView) => {
  return (
    <Card pos="absolute" left={10} bottom={10} p={10} maw="calc(100% - 75px)">
      <Group gap={10}>
        <Badge variant="outline" size="lg" radius="sm">
          X: {x}
        </Badge>
        <Badge variant="outline" size="lg" radius="sm">
          Z: {z}
        </Badge>
        <Text fz="sm">Biome: {biome}</Text>
      </Group>
    </Card>
  );
};

const ZoomControls = ({ loading }: { loading?: boolean }) => {
  return (
    <Stack gap={10} pos="absolute" right={10} bottom={10}>
      <ActionIcon size="xl" title="Jump to Center" loading={loading}>
        <Iconify icon="solar:gps-bold" />
      </ActionIcon>
      <ActionIcon.Group orientation="vertical">
        <ActionIcon size="xl" title="Zoom In">
          <Text fz={25}>+</Text>
        </ActionIcon>
        <ActionIcon size="xl" title="Zoom Out">
          <Text fz={40}>-</Text>
        </ActionIcon>
      </ActionIcon.Group>
    </Stack>
  );
};
