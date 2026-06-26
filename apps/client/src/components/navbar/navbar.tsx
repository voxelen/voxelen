import { AppShell, Divider, ScrollArea, SegmentedControl } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { MapControls } from "@/features/map-core";
import { Header } from "../header";

export const NavBar = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [value, setValue] = useState("map");

  const tabs = [
    { value: "map", label: "Map" },
    { value: "biomes", label: "Biomes" },
    { value: "structures", label: "Structures" },
  ];

  return (
    <AppShell.Navbar zIndex={10}>
      <AppShell.Section>
        {!isMobile && <Header />}
        {!isMobile && <Divider />}
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
