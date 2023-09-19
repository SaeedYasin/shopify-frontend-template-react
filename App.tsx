import { NavigationMenu } from "@shopify/app-bridge-react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import Routes, { type Route } from "./Routes";
import ErrorBoundaryView from "./components/ErrorView";
import { GlobalLoadingIndicator } from "./components/GlobalLoadingIndicator";
import { ShopContextProvider } from "./hooks/index";
import Bugsnag from "./lib/bugsnag";
import { AppBridgeProvider, PolarisProvider, QueryProvider } from "./providers";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob<Route>(
    "./pages/**/!(*.test.[jt]sx)*.([jt]sx)",
    {
      eager: true,
    }
  );
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={ErrorBoundaryView}
            onReset={reset}
            onError={(error, info) => {
              Bugsnag.then((bugsnag) => {
                bugsnag.notify(error, (event) => {
                  event.groupingHash = error.message;
                  event.addMetadata("Info", info);
                  event.unhandled = true;
                  event.severity = "error";
                });
              });
            }}
          >
            <BrowserRouter>
              <AppBridgeProvider>
                <QueryProvider>
                  <GlobalLoadingIndicator />
                  <ShopContextProvider>
                    <HelmetProvider>
                      <NavigationMenu
                        navigationLinks={[
                          {
                            label: "Settings",
                            destination: "/settings",
                          },
                          {
                            label: t("NavigationMenu.pageName"),
                            destination: "/pagename",
                          },
                        ]}
                      />
                      <Routes pages={pages} />
                    </HelmetProvider>
                  </ShopContextProvider>
                </QueryProvider>
              </AppBridgeProvider>
            </BrowserRouter>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </PolarisProvider>
  );
}
