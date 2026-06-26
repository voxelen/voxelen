import { AppShell, Divider, ScrollArea, SegmentedControl } from "@mantine/core";
import { useState } from "react";
import { MapControls } from "@/features/map-manager";
import { Header } from "../header";

export const NavBar = () => {
  const [value, setValue] = useState("map");

  const tabs = [
    { value: "map", label: "Map" },
    { value: "biomes", label: "Biomes" },
    { value: "structures", label: "Structures" },
  ];

  return (
    <AppShell.Navbar zIndex={10}>
      <Header />
      <Divider />
      <AppShell.Section>
        <SegmentedControl
          value={value}
          onChange={setValue}
          data={tabs}
          fullWidth
          size="md"
          mx={20}
          mt={10}
        />
      </AppShell.Section>
      <AppShell.Section component={ScrollArea} px={20} grow>
        {value === "map" && <MapControls />}
        <br />
      </AppShell.Section>
    </AppShell.Navbar>
  );
};
