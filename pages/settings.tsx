import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Page, Text } from "@shopify/polaris";
import { ActiveSubscriptions } from "../components/ActiveSubscriptions";

const Settings = () => {
  return (
    <Page>
      <TitleBar title="Settings" primaryAction={null} />
      <BlockStack align="center" gap={"400"} inlineAlign="center">
        <Text variant="heading2xl" as="h1">
          Settings page
        </Text>
        <ActiveSubscriptions />
      </BlockStack>
    </Page>
  );
};

export default Settings;
