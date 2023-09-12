import { useToast } from "@shopify/app-bridge-react";
import { Button, LegacyCard, Text, VerticalStack } from "@shopify/polaris";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";

function useProductCount() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "products", "count"], async () => {
    const res = await fetch("/api/products/count");
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const { count } = (await res.json()) as { count: number };
    return count;
  });
}

function useProductCreate(noOfProducts = 2) {
  const queryClient = useQueryClient();
  const fetch = useAuthenticatedFetch();
  const { show: showToast } = useToast();
  return useMutation(
    ["api", "product"],
    async () => {
      const res = await fetch("/api/products/create/" + noOfProducts);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
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
  const { mutate } = useProductCreate(2);
  const { data: count, isLoading, error } = useProductCount();
  const { t } = useTranslation();

  return (
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
  );
}
