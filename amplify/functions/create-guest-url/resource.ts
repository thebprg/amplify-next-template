import { defineFunction } from "@aws-amplify/backend";

export const createGuestUrl = defineFunction({
  name: "create-guest-url",
  entry: "./handler.ts",
  resourceGroupName: "data",
  environment: {
    // We will set this in backend.ts
  }
});
