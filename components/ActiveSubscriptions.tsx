import { Toast, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  Button,
  ButtonGroup,
  DataTable,
  LegacyCard,
  LegacyStack,
  Text,
} from "@shopify/polaris";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
    const data: Subscription = await fetch("/api/billing").then(
      (res: Response) => res.json()
    );
    return generateRows(data);
  });
}

function useDoSubscribe(showToast: (msg: string) => void) {
  const fetch = useAuthenticatedFetch();
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  return useMutation(
    ["api", "billing"],
    async () => {
      const { url }: { url: string } = await fetch("/api/billing", {
        method: "POST",
      }).then((res: Response) => res.json());
      redirect.dispatch(Redirect.Action.REMOTE, url);
    },
    {
      onError: () => {
        showToast("Error updating billing plan!");
      },
    }
  );
}

function useDoUnsubscribe(showToast: (msg: string) => void) {
  const queryClient = useQueryClient();
  const fetch = useAuthenticatedFetch();
  return useMutation(
    ["api", "billing"],
    async () => {
      await fetch("/api/billing", {
        method: "DELETE",
      }).then((res: Response) => res.json());
    },
    {
      onMutate: async () => {
        showToast("Updating...");
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(["api", "subscription"]);
        showToast("Billing Plan Updated!");
      },
      onError: () => {
        showToast("Error updating billing plan!");
      },
    }
  );
}

export function ActiveSubscriptions() {
  const subscription = useGetSubscription();
  const [{ toast }, setToast] = useState({ toast: { msg: "", show: false } });
  const showToast = (msg: string) => {
    setToast({ toast: { msg: "", show: false } });
    setToast({ toast: { msg, show: true } });
  };
  const { mutate: unsubscribe } = useDoUnsubscribe(showToast);
  const { mutate: subscribe } = useDoSubscribe(showToast);

  const toastMarkup = toast.show && (
    <Toast
      content={toast.msg}
      onDismiss={() => setToast({ toast: { msg: "", show: false } })}
    />
  );

  return (
    <>
      {toastMarkup}
      <LegacyCard title="Active Subscriptions" sectioned>
        <LegacyCard.Section>
          <LegacyStack alignment="center">
            <Text as="p">Your active subscription is shown below,</Text>
            <LegacyStack alignment="center">
              <ButtonGroup>
                <Button
                  primary
                  loading={subscription.isLoading}
                  onClick={subscribe}
                >
                  Upgrade Plan
                </Button>
                <Button
                  outline
                  loading={subscription.isLoading}
                  onClick={unsubscribe}
                >
                  Downgrade Plan
                </Button>
              </ButtonGroup>
            </LegacyStack>
          </LegacyStack>
        </LegacyCard.Section>
        <LegacyCard.Section>
          <DataTable
            columnContentTypes={["text", "text", "text", "text", "text"]}
            headings={["Plan Name", "Status", "Test", "Trial Days", "Amount"]}
            rows={
              subscription.isLoading
                ? [["Loading..."]]
                : subscription.error
                ? [["Error", `${subscription.error}`]]
                : subscription.data
            }
          />
        </LegacyCard.Section>
      </LegacyCard>
    </>
  );
}
