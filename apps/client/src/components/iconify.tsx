import { Icon, type IconifyIcon, type IconProps, loadIcon } from "@iconify/react";
import { useEffect, useState } from "react";

export type $Iconify = IconProps & { icon: string };

export const Iconify = ({ icon, ...props }: $Iconify) => {
  const [data, setData] = useState<string | IconifyIcon>("");

  useEffect(() => void iconLoader(icon).then(setData), [icon]);

  return <Icon width={20} {...props} icon={data} />;
};

const iconLoader = (icon: string) =>
  new Promise<IconifyIcon>((resolve) => {
    const cached = localStorage.getItem(`iconify$${icon}`);
    if (cached) return resolve(JSON.parse(cached));
    loadIcon(icon).then((data) => {
      localStorage.setItem(`iconify$${icon}`, JSON.stringify(data));
      resolve(data);
    });
  });
