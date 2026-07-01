import { AppShell } from "@mantine/core";
import { NavBar, NavbarToggle, useNavBar } from "../navbar";

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [opened] = useNavBar();
  const navbar = {
    width: 400,
    collapsed: { mobile: !opened, desktop: !opened },
    breakpoint: "sm",
  };

  return (
    <AppShell h="100%" navbar={navbar}>
      <NavBar />
      <NavbarToggle />
      <AppShell.Main h="100%">{children}</AppShell.Main>
    </AppShell>
  );
};
