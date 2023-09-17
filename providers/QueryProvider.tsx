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
      Bugsnag.then((bugsnag) => {
        bugsnag.notify(error as string, (event) => {
          event.addMetadata("Query", data);
        });
      });
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (result: { success: boolean; error: string }, data) => {
      if (!result || !result.success) {
        Bugsnag.then((bugsnag) => {
          bugsnag.notify(result?.error || "Unknown error", (event) => {
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
        bugsnag.notify(error as string, (event) => {
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
