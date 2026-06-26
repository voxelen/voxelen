import { ActionIcon, Badge, Card, Center, Group, Text } from "@mantine/core";
import { BIOMES } from "@repo/shared/constants";
import { Iconify } from "@/components/iconify";
import { useBiomeAt } from "@/features/engine";
import { useMapState } from "../hooks";

export const MapView = () => {
  const controls = useMapState();
  const biomeId = useBiomeAt(controls.values);

  const biome = BIOMES.find((biome) => biome.id === biomeId);

  if (!biome) return null;

  return (
    <Center h="100%" w="100%" p={10}>
      <Card h="100%" w="100%" p={0} pos="relative">
        <canvas style={{ backgroundColor: biome.color, width: "100%", height: "100%" }}></canvas>
        <CursorView biome={biome.label} x={controls.coordinates.x} z={controls.coordinates.z} />
        <ZoomControls />
      </Card>
    </Center>
  );
};

type $CursorView = { biome: string; x: number; z: number };
const CursorView = ({ biome, x, z }: $CursorView) => {
  return (
    <Card pos="absolute" left={10} bottom={10} p={10}>
      <Group gap={10} wrap="nowrap">
        <Badge variant="outline" leftSection="X: " size="lg" radius="sm">
          {x}
        </Badge>
        <Badge variant="outline" leftSection="Z: " size="lg" radius="sm">
          {z}
        </Badge>
        <Text fz="sm">Biome: {biome}</Text>
      </Group>
    </Card>
  );
};

const ZoomControls = () => {
  return (
    <ActionIcon.Group pos="absolute" right={10} bottom={10} orientation="vertical">
      <ActionIcon size="xl">
        <Text fz={25}>+</Text>
      </ActionIcon>
      <ActionIcon size="xl">
        <Text fz={40}>-</Text>
      </ActionIcon>
      <ActionIcon size="xl">
        <Iconify icon="solar:gps-bold" />
      </ActionIcon>
    </ActionIcon.Group>
  );
};
