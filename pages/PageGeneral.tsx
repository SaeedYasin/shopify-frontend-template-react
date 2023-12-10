import { Card, Image, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { useNavigate } from "react-router";
import trophyImgUrl from "../assets/home-trophy.png";
import mixpanel from "../lib/mixpanel";

const updateMixPanel = () => {
  mixpanel.then((mp) => {
    mp.track("General Page View", {
      source: "Some source",
    });
  });
};

export default function PageGeneral() {
  updateMixPanel();

  const navigate = useNavigate();
  return (
    <Page
      title="Page General"
      fullWidth
      backAction={{
        content: "Back",
        onAction: () => navigate(-1),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack gap={"200"} align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h1">
                Page General Example
              </Text>
              <div style={{ padding: "0 20px" }}>
                <Image
                  source={trophyImgUrl}
                  alt="Nice work on building a Shopify app"
                  width={120}
                />
              </div>
            </InlineStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <Text variant="headingMd" as="h2">
              Secondary Section
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
