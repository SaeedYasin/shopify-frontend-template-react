import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { GlobalLoadingIndicator } from "./components/GlobalLoadingIndicator";
import { AppBridgeProvider, QueryProvider, PolarisProvider } from "./providers";
import { ShopContextProvider } from "./hooks/index";
import { HelmetProvider } from "react-helmet-async";
import type { Route } from "./Routes";

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
    </PolarisProvider>
  );
}
