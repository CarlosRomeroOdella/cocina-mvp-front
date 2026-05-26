import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "d1e25291-3a7e-4a4c-9bac-170a88c91c55",
    authority: "https://login.microsoftonline.com/61ba182d-8fe7-448a-98ee-9dcb78e3c856",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
  redirectUri: `${window.location.origin}/blank.html`,
};

export const msalInstance = new PublicClientApplication(msalConfig);
