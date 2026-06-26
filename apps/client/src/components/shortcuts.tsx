import {
  Card,
  Divider,
  Group,
  Kbd,
  Menu,
  Modal,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { Fragment } from "react";
import { Iconify } from "./iconify";
import { useNavBar } from "./navbar";

const state = atom(false);

const Shortcut = ({ label, keys }: { label: string; keys: string[] }) => (
  <Group justify="space-between">
    <Text fz="sm">{label}</Text>
    <Group gap={10}>
      <Kbd>{keys[0]}</Kbd>
      <Text> + </Text>
      <Kbd>{keys[1]}</Kbd>
    </Group>
  </Group>
);

export const ShortcutsToggle = () => {
  const [opened, setOpened] = useAtom(state);

  return (
    <Menu.Item
      onClick={() => setOpened(!opened)}
      leftSection={<Iconify icon="solar:keyboard-bold" />}
    >
      Keyboard Shortcuts
    </Menu.Item>
  );
};

export const ShortcutsView = () => {
  const navigate = useNavigate();
  const [opened, setOpened] = useAtom(state);
  const { toggleColorScheme } = useMantineColorScheme();
  const [navbarOpened, setNavbarOpened] = useNavBar();

  useHotkeys([
    ["mod + j", toggleColorScheme],
    ["mod + .", () => navigate({ href: "/settings" })],
    ["mod + b", () => setNavbarOpened(!navbarOpened)],
    ["mod + /", () => setOpened(!opened)],
  ]);

  const shortcuts = [
    { label: "Toggle Theme", keys: ["⌘", "J"] },
    { label: "Open Settings", keys: ["⌘", "."] },
    { label: "Toggle Navbar", keys: ["⌘", "B"] },
    { label: "Keyboard Shortcuts", keys: ["⌘", "/"] },
  ];

  return (
    <Modal title="Keyboard Shortcuts" opened={opened} onClose={() => setOpened(false)}>
      <Stack component={Card} gap={15}>
        {shortcuts.map((shortcut, index) => (
          <Fragment key={shortcut.label}>
            {index > 0 && <Divider />}
            <Shortcut label={shortcut.label} keys={shortcut.keys} />
          </Fragment>
        ))}
      </Stack>
    </Modal>
  );
};
