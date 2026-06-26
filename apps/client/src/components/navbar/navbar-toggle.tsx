import { ActionIcon } from "@mantine/core";
import { Iconify } from "../iconify";
import { useNavBar } from "./use-navbar";

export const NavbarToggle = () => {
  const [opened, setOpened] = useNavBar();
  const icon = opened ? "solar:list-cross-minimalistic-bold" : "solar:list-bold";

  return (
    <ActionIcon
      pos="fixed"
      style={{ top: 20, left: 20, zIndex: 100 }}
      onClick={() => setOpened(!opened)}
    >
      <Iconify height={25} icon={icon} />
    </ActionIcon>
  );
};
