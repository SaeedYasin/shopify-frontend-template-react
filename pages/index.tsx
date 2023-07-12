import { TitleBar } from "@shopify/app-bridge-react";
import {
  ActionList,
  VerticalStack,
  Image,
  Layout,
  LegacyCard,
  LegacyStack,
  Link,
  Page,
  Text,
} from "@shopify/polaris";
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import trophyImgUrl from "../assets/home-trophy.png";
import mixpanel from "../lib/mixpanel";
const ProductsCard = React.lazy(() => import("../components/ProductsCard"));
import { useTranslation, Trans } from "react-i18next";

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
          <LegacyCard sectioned>
            <LegacyStack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <LegacyStack.Item fill>
                <VerticalStack gap={"4"}>
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
                </VerticalStack>
              </LegacyStack.Item>
              <LegacyStack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImgUrl}
                    alt={t("HomePage.trophyAltText")}
                    width={120}
                  />
                </div>
              </LegacyStack.Item>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section secondary>
          <Suspense fallback={<div>Loading...</div>}>
            <ProductsCard />
          </Suspense>
        </Layout.Section>
        <Layout.Section fullWidth>
          <LegacyCard>
            <ActionList actionRole="menuitem" items={pagesLinks} />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
