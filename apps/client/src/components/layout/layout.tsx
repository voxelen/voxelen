import { AppShell } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useLocation } from "@tanstack/react-router";
import { Header } from "../header";
import { NavBar, NavbarToggle, useNavBar } from "../navbar";
import { ScrollTop } from "../scroll-top";
import { ShortcutsView } from "../shortcuts";

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [opened] = useNavBar();
  const disabled = useLocation().pathname !== "/";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navbar = {
    width: 400,
    collapsed: { mobile: !opened, desktop: !opened },
    breakpoint: "sm",
  };

  return (
    <AppShell
      h="100%"
      header={{ height: 74, collapsed: !isMobile }}
      disabled={disabled}
      navbar={navbar}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <NavBar />
      {!disabled && <NavbarToggle />}
      <AppShell.Main h="100%">
        {children}
        <ShortcutsView />
        <ScrollTop />
      </AppShell.Main>
    </AppShell>
  );
};
