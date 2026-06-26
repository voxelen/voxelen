import { Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { CONFIG } from "@/features/const";
import { ThemeSwitcher } from "../theme-switcher";
import { HeaderMenu } from "./header-menu";

export const Header = () => {
  return (
    <Group h={74} pl={66} pr={20} justify="space-between">
      <Group gap={10} align="center">
        <Text component={Link} c="text" to="/" fz={30} fw="bold">
          {CONFIG.title}
        </Text>
      </Group>
      <Group gap={10} align="center">
        <ThemeSwitcher />
        <HeaderMenu />
      </Group>
    </Group>
  );
};
