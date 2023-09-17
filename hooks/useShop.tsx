/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useAuthenticatedFetch } from "../hooks";
import Bugsnag from "../lib/bugsnag.js";
import mixpanel from "../lib/mixpanel";

type ShopObj = { shop: string };
type Action = {
  type: "GET_SHOP" | "UPDATE_SHOP";
  payload?: ShopObj;
};

const initialState = {
  state: {},
  getShop: () => {
    /* */
  },
  updateShop: (payload: ShopObj) => {
    /* */
  },
};
const shopContext = createContext<{
  state: any;
  getShop: () => void;
  updateShop: (payload: ShopObj) => void;
}>(initialState);

function reducer(state: any, action: Action) {
  switch (action.type) {
    case "GET_SHOP": {
      return {
        ...state,
      };
    }

    case "UPDATE_SHOP": {
      return {
        ...action.payload,
      };
    }

    default:
      return null;
  }
}

export const ShopProvider = (props: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/shop/name");
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const shop = (await res.json()) as ShopObj;
      updateShop(shop);
      mixpanel.then((mp) => {
        mp.identify(shop.shop);
        mp.register({ shop: shop.shop });
      });
      Bugsnag.then((bugsnag) => {
        bugsnag.setUser(shop.shop, "", shop.shop);
        bugsnag.addMetadata("shop", shop);
      });
    })();
  }, []);

  const getShop = () => {
    dispatch({ type: "GET_SHOP" });
  };

  const updateShop = (payload: ShopObj) => {
    dispatch({ type: "UPDATE_SHOP", payload });
  };

  const value = useMemo(
    () => ({
      state,
      getShop,
      updateShop,
    }),
    [state]
  );

  return <shopContext.Provider value={value} {...props} />;
};

export const useShop = () => {
  const context = useContext(shopContext);

  if (context === undefined) {
    throw new Error(`useShop must be used within ShopProvider`);
  }

  return context;
};

export const ShopContextProvider = ({ children }: PropsWithChildren) => {
  return <ShopProvider>{children}</ShopProvider>;
};
