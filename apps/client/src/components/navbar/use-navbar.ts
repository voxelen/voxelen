import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export const useNavBar = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, setOpened] = useLocalStorage({ key: "navbar-opened", defaultValue: true });
  const { pathname } = useLocation();

  useEffect(() => {
    if (isMobile && pathname) setOpened(false);
  }, [pathname, isMobile, setOpened]);

  return [opened, setOpened] as const;
};
