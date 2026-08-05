import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  BedrockResponse: a.customType({
    body: a.string(),
    error: a.string(),
  }),
  askBedrock: a
    .query()
    .arguments({
      ingredients: a.string().array(),


    })
    .returns(a.ref("BedrockResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(
      a.handler.custom({
        entry: "./bedrockResolver.js",
        dataSource: "bedrockDS"
      })
    ),
  UserProfile: a.model({
    owner: a.string(),
    age: a.integer(),
    weightKg: a.float(),
    heightCm: a.float(),
    activityLevel: a.string(), // sedentary, moderate, active, etc.
    fitnessGoal: a.string(),   // cut, bulk, maintain
    dietaryRestrictions: a.string().array(),
  }).authorization((allow) => [allow.owner()]),

  WorkoutLog: a.model({
    owner: a.string(),
    date: a.date(),
    type: a.string(),
    durationMin: a.integer(),
    caloriesBurned: a.integer(),
  }).authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

