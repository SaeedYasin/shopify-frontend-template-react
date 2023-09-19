import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import Bugsnag from "../lib/bugsnag";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, data) => {
      const errorMsg = error as string;
      Bugsnag.then((bugsnag) => {
        bugsnag.notify(errorMsg, (event) => {
          event.groupingHash = errorMsg;
          event.addMetadata("Query", data);
        });
      });
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (result: { success: boolean; error: string }, data) => {
      if (!result || !result.success) {
        Bugsnag.then((bugsnag) => {
          const errorMsg = result?.error || "Unknown error";
          bugsnag.notify(errorMsg, (event) => {
            event.groupingHash = errorMsg;
            event.addMetadata("Mutation", data);
            event.addMetadata("Result", result);
            event.unhandled = true;
            event.severity = "error";
          });
        });
      }
    },
    onError: (error, data) => {
      Bugsnag.then((bugsnag) => {
        const errorMsg = error as string;
        bugsnag.notify(errorMsg, (event) => {
          event.groupingHash = errorMsg;
          event.addMetadata("Mutation", data);
          event.unhandled = true;
          event.severity = "error";
        });
      });
    },
  }),
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
