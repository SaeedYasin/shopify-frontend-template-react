import { useAppBridge, useToast } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Subscription } from "../../@types/billing";
import { useAuthenticatedFetch } from "../hooks";

function generateRows(subscriptionData: Subscription) {
  const activeSubscriptions =
    subscriptionData.appInstallation.activeSubscriptions;
  if (activeSubscriptions.length === 0) {
    return [["No Plan", "N/A", "N/A", "N/A", "USD 0.00"]];
  } else {
    return Object.entries(activeSubscriptions).map((subData) => {
      const value = subData[1];
      const { name, status, test, trialDays } = value;
      const { amount, currencyCode } =
        value.lineItems[0].plan.pricingDetails.price;
      return [
        name,
        status,
        `${test}`,
        `${trialDays}`,
        `${currencyCode} ${amount}`,
      ];
    });
  }
}

function useGetSubscription() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "subscription"], async () => {
    const res = await fetch("/api/billing");
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const data = (await res.json()) as Subscription;
    return generateRows(data);
  });
}

function useDoSubscribe() {
  const fetch = useAuthenticatedFetch();
  const { show: showToast } = useToast();
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  return useMutation(
    ["api", "billing"],
    async () => {
      const res = await fetch("/api/billing", {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.text();
        return { success: false, error };
      }
      const { url } = (await res.json()) as { url: string };
      redirect.dispatch(Redirect.Action.REMOTE, url);
      return { success: true };
    },
    {
      onError: () => {
        showToast("Error updating billing plan!");
      },
    }
  );
}

function useDoUnsubscribe() {
  const queryClient = useQueryClient();
  const fetch = useAuthenticatedFetch();
  const { show: showToast } = useToast();
  return useMutation(
    ["api", "billing"],
    async () => {
      const res = await fetch("/api/billing", {
        method: "DELETE",
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
      },
      onSuccess: async ({ success }: { success: boolean }) => {
        if (success) {
          await queryClient.invalidateQueries(["api", "subscription"]);
          showToast("Billing Plan Updated!");
        } else {
          showToast("Error updating billing plan!");
        }
      },
      onError: () => {
        showToast("Error updating billing plan!");
      },
    }
  );
}

export function ActiveSubscriptions() {
  const { data, isLoading, isError, error } = useGetSubscription();
  const { mutate: unsubscribe } = useDoUnsubscribe();
  const { mutate: subscribe } = useDoSubscribe();

  if (isError) {
    throw new Error(`Default:${error}`);
  }

  return (
    <Card>
      <BlockStack gap={"400"}>
        <Text variant="headingMd" as="h1">
          Active Subscriptions
        </Text>
        <InlineStack gap={"400"} blockAlign="center">
          <Text as="p">Your active subscription is shown below,</Text>
          <InlineStack gap={"200"} blockAlign="center">
            <ButtonGroup>
              <Button loading={isLoading} onClick={subscribe} variant="primary">
                Upgrade Plan
              </Button>
              <Button loading={isLoading} onClick={unsubscribe}>
                Downgrade Plan
              </Button>
            </ButtonGroup>
          </InlineStack>
        </InlineStack>
        <DataTable
          columnContentTypes={["text", "text", "text", "text", "text"]}
          headings={["Plan Name", "Status", "Test", "Trial Days", "Amount"]}
          rows={
            isLoading
              ? [["Loading..."]]
              : error
                ? [["Error", `${error}`]]
                : data
          }
        />
      </BlockStack>
    </Card>
  );
}
