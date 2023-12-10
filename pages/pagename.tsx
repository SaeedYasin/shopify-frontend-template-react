import { TitleBar } from "@shopify/app-bridge-react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

export default function PageName() {
  const { t } = useTranslation();
  return (
    <Page>
      <TitleBar
        title={t("PageName.title")}
        primaryAction={{
          content: t("PageName.primaryAction"),
          onAction: () => console.log("Primary action"),
        }}
        secondaryActions={[
          {
            content: t("PageName.secondaryAction"),
            onAction: () => console.log("Secondary action"),
          },
        ]}
      />
      <Layout>
        <Layout.Section>
          <BlockStack gap={"200"}>
            <Card>
              <Text variant="headingMd" as="h2">
                {t("PageName.heading")}
              </Text>
              <Text variant="bodyMd" as="p">
                {t("PageName.body")}
              </Text>
            </Card>
            <Card>
              <Text variant="headingMd" as="h2">
                {t("PageName.heading")}
              </Text>
              <Text variant="bodyMd" as="p">
                {t("PageName.body")}
              </Text>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <Text variant="headingMd" as="h2">
              {t("PageName.heading")}
            </Text>
            <Text variant="bodyMd" as="p">
              {t("PageName.body")}
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
