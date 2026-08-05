import { defineBackend } from "@aws-amplify/backend";
import { data } from "./amplify/data/resource";
import { auth } from "./amplify/auth/resource";

const backend = defineBackend({
  auth,
  data,
});

backend.data.addHttpDataSource("bedrockDS", "https://bedrock-runtime.us-east-1.amazonaws.com", {
  authorizationConfig: {
    signingRegion: "us-east-1",
    signingServiceName: "bedrock",
  },
});
