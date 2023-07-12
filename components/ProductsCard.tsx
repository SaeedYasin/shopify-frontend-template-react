import { useState } from "react";
import { LegacyCard, Text, VerticalStack, Button } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

function useProductCount() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "products", "count"], async () => {
    const { count } = await fetch("/api/products/count").then((res) =>
      res.json()
    );
    return count as number;
  });
}

function useProductCreate(noOfProducts = 2, showToast: (msg: string) => void) {
  const queryClient = useQueryClient();
  const fetch = useAuthenticatedFetch();
  return useMutation(
    ["api", "product"],
    async () => {
      await fetch("/api/products/create/" + noOfProducts);
    },
    {
      onMutate: async () => {
        showToast("Updating...");
        await queryClient.cancelQueries(["api", "products", "count"]);
        const previousCount: number = +queryClient.getQueryData([
          "api",
          "products",
          "count",
        ]);
        queryClient.setQueryData(
          ["api", "products", "count"],
          () => previousCount + 2
        );
        return { previousCount };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(
          ["api", "products", "count"],
          context.previousCount
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["api", "products", "count"]);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(["api", "products", "count"]);
        showToast("2 products created!");
      },
    }
  );
}

export default function ProductsCard() {
  const [{ toast }, setToast] = useState({ toast: { msg: "", show: false } });
  const showToast = (msg: string) => {
    setToast({ toast: { msg: "", show: false } });
    setToast({ toast: { msg, show: true } });
  };
  const { mutate } = useProductCreate(2, showToast);
  const { data: count, isLoading, error } = useProductCount();
  const { t } = useTranslation();

  const toastMarkup = toast.show && (
    <Toast
      content={toast.msg}
      onDismiss={() => setToast({ toast: { msg: "", show: false } })}
    />
  );

  return (
    <>
      {toastMarkup}
      <LegacyCard title={t("ProductsCard.title")} sectioned>
        <VerticalStack gap={"4"}>
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Text variant="headingMd" as="h1">
            {t("ProductsCard.totalProductsHeading")}
            <Text variant="heading2xl" as="p">
              {isLoading && ".."}
              {error && "??"}
              {!isLoading && count}
            </Text>
          </Text>
          <Button outline loading={isLoading} onClick={mutate}>
            {t("ProductsCard.populateProductsButton", {
              count: 2,
            })}
          </Button>
        </VerticalStack>
      </LegacyCard>
    </>
  );
}
