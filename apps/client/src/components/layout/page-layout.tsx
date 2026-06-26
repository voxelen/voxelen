import { ActionIcon, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Iconify } from "@/components/iconify";

type $PageLayout = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  withBack?: boolean;
  icon?: string;
};

export const PageLayout = (props: $PageLayout) => {
  return (
    <Stack px={20} py={20}>
      <Group align="flex-start" mb={5}>
        <Stack flex={1} gap={10}>
          <Group gap={15}>
            {props.withBack && (
              <ActionIcon onClick={() => history.back()}>
                <Iconify icon="solar:arrow-left-bold" />
              </ActionIcon>
            )}
            {props.icon && !props.withBack && (
              <ThemeIcon variant="light">
                <Iconify icon={props.icon} />
              </ThemeIcon>
            )}
            <Title order={2}>{props.title}</Title>
          </Group>
          {props.description && <Text c="dimmed">{props.description}</Text>}
        </Stack>
        {props.action}
      </Group>
      {props.children}
      <Stack h={40} />
    </Stack>
  );
};
