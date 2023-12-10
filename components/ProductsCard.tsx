import { useToast } from "@shopify/app-bridge-react";
import { BlockStack, Button, Card, Text } from "@shopify/polaris";
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
      const res = await fetch("/api/products/create/" + noOfProducts, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.text();
        return { success: false, error };
      }
      return { success: true };
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
        showToast("Error creating products", { isError: true });
      },
      onSettled: () => {
        queryClient.invalidateQueries(["api", "products", "count"]);
      },
      onSuccess: async ({ success }: { success: boolean }) => {
        if (success) {
          await queryClient.invalidateQueries(["api", "products", "count"]);
          showToast("2 products created!");
        } else {
          showToast("Error creating products!", { isError: true });
        }
      },
    }
  );
}

export default function ProductsCard() {
  const { mutate } = useProductCreate(2);
  const { data: count, isLoading, isError, error } = useProductCount();
  const { t } = useTranslation();

  if (isError) {
    throw new Error(`Default:${error}`);
  }

  return (
    <Card>
      <BlockStack gap={"400"}>
        <Text variant="headingMd" as="h1">
          {t("ProductsCard.title")}
        </Text>
        <Text variant="bodyMd" as="p">
          Sample products are created with a default title and price. You can
          remove them at any time.
        </Text>
        <Text variant="headingMd" as="h1">
          {t("ProductsCard.totalProductsHeading")}
          <Text variant="heading2xl" as="p">
            {isLoading && ".."}
            {!isLoading && count}
          </Text>
        </Text>
        <Button loading={isLoading} onClick={mutate}>
          {t("ProductsCard.populateProductsButton", {
            count: 2,
          })}
        </Button>
      </BlockStack>
    </Card>
  );
}
