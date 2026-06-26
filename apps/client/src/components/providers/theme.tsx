import * as Core from "@mantine/core";
import { useAutoContrast, useDisplaySize, useFontFamily } from "@/features/settings";

export const useAppTheme = () => {
  const [fontFamily] = useFontFamily();
  const [autoContrast] = useAutoContrast();
  const [scale] = useDisplaySize();

  return Core.createTheme({
    fontFamily: `${fontFamily}, sans-serif`,
    primaryColor: "green",
    defaultRadius: "md",
    autoContrast,
    scale,
    components: {
      ActionIcon: Core.ActionIcon.extend({ defaultProps: { size: 36, variant: "default" } }),
      Card: Core.Card.extend({ defaultProps: { withBorder: true } }),
      Select: Core.Select.extend({
        defaultProps: { checkIconPosition: "right", allowDeselect: false },
      }),
      Modal: Core.Modal.extend({
        defaultProps: { transitionProps: { transition: "fade-up" }, centered: true },
      }),
      Menu: Core.Menu.extend({
        defaultProps: {
          // shadow: "sm",
          keepMounted: true, // keep in DOM, required for modals
          arrowPosition: "center",
          withinPortal: false,
          withArrow: true,
          arrowSize: 12,
        },
      }),
    },
  });
};
