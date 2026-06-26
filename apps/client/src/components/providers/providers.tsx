import { MantineProvider } from "@mantine/core";
import { EngineProvider } from "@/features/engine";
import { TextStyleLoader } from "@/features/settings";
import { useAppTheme } from "./theme";

import "@mantine/core/styles.css";
import "@/assets/styles/global.scss";

export const Providers = ({ children }: { children?: React.ReactNode }) => {
  const theme = useAppTheme();

  return (
    <EngineProvider>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <meta name="theme-color" content="var(--mantine-color-body)" />
        <TextStyleLoader />
        {children}
      </MantineProvider>
    </EngineProvider>
  );
};
