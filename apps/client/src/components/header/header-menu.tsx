import { ActionIcon, Anchor, Menu } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Iconify } from "../iconify";
import { ShortcutsToggle } from "../shortcuts";

export const HeaderMenu = () => {
  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <ActionIcon>
          <Iconify rotate={1} icon="solar:menu-dots-bold" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={250}>
        <Anchor component={Link} to="/settings" underline="never">
          <Menu.Item leftSection={<Iconify icon="solar:settings-bold" />}>Settings</Menu.Item>
        </Anchor>
        <Menu.Divider />
        <ShortcutsToggle />
        <Anchor
          href="https://github.com/voxelen/voxelen/issues/new"
          target="_blank"
          underline="never"
        >
          <Menu.Item leftSection={<Iconify icon="solar:bug-bold" />}>Report an issue</Menu.Item>
        </Anchor>
        <Anchor href="https://github.com/voxelen/voxelen" target="_blank" underline="never">
          <Menu.Item leftSection={<Iconify icon="solar:code-bold" />}>Open Source</Menu.Item>
        </Anchor>
        <Menu.Divider />
        <Anchor component={Link} to="/about" underline="never">
          <Menu.Item leftSection={<Iconify icon="solar:info-circle-bold" />}>About</Menu.Item>
        </Anchor>
      </Menu.Dropdown>
    </Menu>
  );
};
