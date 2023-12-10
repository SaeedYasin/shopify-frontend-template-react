import { TitleBar } from "@shopify/app-bridge-react";
import {
  ActionList,
  BlockStack,
  Card,
  Image,
  InlineStack,
  Layout,
  Link,
  Page,
  Text,
} from "@shopify/polaris";
import React, { Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import trophyImgUrl from "../assets/home-trophy.png";
import mixpanel from "../lib/mixpanel";
const ProductsCard = React.lazy(() => import("../components/ProductsCard"));

const updateMixPanel = () => {
  mixpanel.then((mp) => {
    mp.track("HomePage View", {
      source: "Some source",
    });
  });
};

export default function HomePage() {
  const { t } = useTranslation();
  updateMixPanel();

  const navigate = useNavigate();
  const pagesLinks = [
    {
      content: "Page Index Example",
      helpText: "Page Index route",
      onAction: () => navigate("/PageIndex"),
    },
    {
      content: "Page Generic Example",
      helpText: "Page Generic route",
      onAction: () => navigate("/PageGeneral"),
    },
  ];

  return (
    <Page>
      <TitleBar title={t("HomePage.title")} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack gap={"400"} align="space-between" wrap={false}>
              <BlockStack gap={"400"}>
                <Text as="h2" variant="headingMd">
                  {t("HomePage.heading")}
                </Text>
                <p>
                  <Trans
                    i18nKey="HomePage.yourAppIsReadyToExplore"
                    components={{
                      PolarisLink: (
                        <Link
                          url="https://polaris.shopify.com/"
                          target="_blank"
                        />
                      ),
                      AdminApiLink: (
                        <Link
                          url="https://shopify.dev/api/admin-graphql"
                          target="_blank"
                        />
                      ),
                      AppBridgeLink: (
                        <Link
                          url="https://shopify.dev/apps/tools/app-bridge"
                          target="_blank"
                        />
                      ),
                    }}
                  />
                </p>
                <p>{t("HomePage.startPopulatingYourApp")}</p>
                <p>
                  <Trans
                    i18nKey="HomePage.learnMore"
                    components={{
                      ShopifyTutorialLink: (
                        <Link
                          url="https://shopify.dev/apps/getting-started/add-functionality"
                          target="_blank"
                        />
                      ),
                    }}
                  />
                </p>
              </BlockStack>
              <div style={{ padding: "0 20px" }}>
                <Image
                  source={trophyImgUrl}
                  alt={t("HomePage.trophyAltText")}
                  width={120}
                />
              </div>
            </InlineStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Suspense fallback={<div>Loading...</div>}>
            <ProductsCard />
          </Suspense>
        </Layout.Section>
        <Layout.Section variant="fullWidth">
          <Card padding={"0"}>
            <ActionList actionRole="menuitem" items={pagesLinks} />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
