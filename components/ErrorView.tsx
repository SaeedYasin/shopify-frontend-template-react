import { Banner, BlockStack, Layout, Page } from "@shopify/polaris";
import { FallbackProps } from "react-error-boundary";

export default function ErrorBoundaryView({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const eMsg = typeof error === "string" ? error : error.message;
  const defaultError = eMsg.includes("Default:") ? true : false;
  const errorMsg = defaultError ? eMsg.replace("Default:", "") : eMsg;
  const line1 = defaultError
    ? "There was a network error."
    : "This error has been reported and will be resolved in a few days.";
  const line2 = defaultError
    ? "Please try again by refreshing the page in a few minutes."
    : "We apologize for any inconvenience caused. Kindly reload the page to resume.";
  const line3 = defaultError
    ? "If the issue persists, please contact support."
    : "";

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <div style={{ marginTop: "100px" }}>
            <Banner
              tone="critical"
              title="Something went wrong!"
              action={{
                content: "Reload",
                onAction: () => resetErrorBoundary(),
              }}
            >
              <BlockStack gap={"400"}>
                <p style={{ color: "var(--p-color-text)" }}>{line1}</p>
                <p style={{ color: "var(--p-color-text-critical)" }}>
                  {errorMsg}
                </p>
                <p style={{ color: "var(--p-color-text)" }}>{line2}</p>
                {line3 && (
                  <p style={{ color: "var(--p-color-text)" }}>{line3}</p>
                )}
              </BlockStack>
            </Banner>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
