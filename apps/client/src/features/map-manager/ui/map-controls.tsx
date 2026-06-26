import {
  Button,
  Divider,
  Group,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { BIOMES, MINECRAFT_VERSIONS, STRUCTURES } from "@repo/shared/constants";
import { useMapControls } from "../hooks";

export const MapControls = () => {
  const state = useMapControls();

  return (
    <Stack mt={10} gap="sm">
      <Group align="flex-end" gap="sm">
        <TextInput
          label="Seed"
          value={state.seed}
          onChange={(e) => state.setSeed(e.target.value)}
          flex={1}
        />
        <Button onClick={state.reset}>Reset All</Button>
      </Group>
      <Select
        label="Minecraft Version"
        value={state.versionId.toString()}
        onChange={(value) => state.setVersionId(Number(value))}
        data={MINECRAFT_VERSIONS.map((version) => ({
          value: version.id.toString(),
          label: `${version.name} - ${version.label}`,
        }))}
      />
      <div>
        <Text size="sm" mb={5}>
          Dimension:
        </Text>
        <SegmentedControl
          onChange={(value) => state.setDimension(Number(value))}
          value={state.dimension.toString()}
          size="md"
          fullWidth
          data={[
            { value: "0", label: "Overworld" },
            { value: "-1", label: "Nether" },
            { value: "1", label: "The End" },
          ]}
        />
      </div>
      <Divider />
      <Select
        label="View Level"
        leftSection="Y"
        onChange={(value) => state.setBiomeHeight(Number(value))}
        comboboxProps={{ width: 200, position: "bottom-start" }}
        value={state.biomeHeight.toString()}
        data={[
          { value: "256", label: "Surface (256)" },
          { value: "128", label: "Nether Roof (128)" },
          { value: "63", label: "Sea Level (63)" },
          { value: "0", label: "Underground (0)" },
          { value: "-64", label: "Bottom (-64)" },
        ]}
      />
      <div>
        <Text size="sm" mb={5}>
          Coordinates:
        </Text>
        <Group gap="sm" grow>
          <NumberInput
            leftSection="X"
            value={state.coordinates.x.toString()}
            onChange={(value) => state.setCoordinates({ ...state.coordinates, x: Number(value) })}
          />
          <NumberInput
            leftSection="Z"
            value={state.coordinates.z.toString()}
            onChange={(value) => state.setCoordinates({ ...state.coordinates, z: Number(value) })}
          />
        </Group>
      </div>
      <Switch
        label="Enable Large Biomes"
        checked={state.isLargeBiome}
        onChange={(e) => state.setIsLargeBiome(e.target.checked)}
      />
      <Divider />
      <MultiSelect
        label="Structures"
        placeholder="Filter specific structures"
        data={STRUCTURES.map(({ id, label }) => ({ value: id.toString(), label }))}
        onChange={(value) => state.setStructures(value.map((v) => Number(v)))}
        value={state.structures.map((structure) => structure.toString())}
        nothingFoundMessage="No structure matches your search"
        checkIconPosition="right"
        searchable
        clearable
      />
      <MultiSelect
        label="Biomes"
        placeholder="Highlight specific biomes"
        data={BIOMES.map(({ id, label }) => ({ value: id.toString(), label }))}
        onChange={(value) => state.setBiomes(value.map((v) => Number(v)))}
        value={state.biomes.map((biome) => biome.toString())}
        nothingFoundMessage="No biome matches your search"
        checkIconPosition="right"
        searchable
        clearable
      />
    </Stack>
  );
};
