# MealPrep AI

An AI-powered recipe generator that tailors suggestions to your fitness goals. Enter a few ingredients you have on hand, and MealPrep AI generates a recipe idea via Amazon Bedrock — personalized using your profile (age, height, weight, activity level, fitness goal, dietary restrictions) and recent workout history when available.

## Features

- **Recipe Generator** — enter ingredients, get an AI-generated recipe idea (powered by Amazon Bedrock, model `amazon.nova-lite-v1:0`)
- **Profile Setup** — store body stats, activity level, fitness goal, and dietary restrictions to personalize recipe suggestions
- **Workout Log** — track workouts (type, duration, calories burned); recent activity (last 3 months) is factored into recipe context
- **Auth** — email/password sign-up and sign-in via Amazon Cognito, with per-user data isolation (owner-based authorization)

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [AWS Amplify](https://docs.amplify.aws/) (Gen 2) for auth, data, and backend infrastructure
- [Amazon Bedrock](https://aws.amazon.com/bedrock/) for recipe generation
- [Oxlint](https://oxc.rs/) for linting
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven change management

## Prerequisites

- Node.js (LTS recommended)
- Everything — auth (Cognito), data, and Bedrock calls — runs under a single AWS account: whoever deploys the backend. End users just sign up/sign in through the deployed app; they don't need their own AWS account or credentials. A separate AWS account is only needed if someone wants to run their own independent deployment (e.g., forking this repo for their own project).

## Getting Started

Install dependencies:

```bash
npm install
```

Deploy a sandbox backend (auth, data, and the Bedrock resolver) and generate `amplify_outputs.json`:

```bash
npx ampx sandbox
```

In a separate terminal, start the dev server:

```bash
npm run dev
```

## Scripts

| Command           | Description                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the Vite dev server                     |
| `npm run build`    | Type-check and build for production           |
| `npm run preview`  | Preview the production build locally          |
| `npm run lint`     | Run Oxlint                                     |

## Project Structure

```
src/
  App.tsx                    # App shell, nav, and Recipe Generator page
  components/
    UserProfileForm.tsx      # Profile Setup page
    WorkoutLog.tsx            # Workout Log page
  graphql/                    # Generated GraphQL types/queries
amplify/
  auth/resource.ts            # Cognito auth configuration
  data/resource.ts            # Data models (UserProfile, WorkoutLog) and askBedrock query
  data/bedrockResolver.js     # Custom resolver that calls Amazon Bedrock
  backend.ts                  # Backend entry point
openspec/                     # Specs and in-progress change proposals
```

## Data Model

- **UserProfile** — `age`, `weightLbs`, `heightIn`, `activityLevel`, `fitnessGoal`, `dietaryRestrictions[]`
- **WorkoutLog** — `date`, `type`, `durationMin`, `caloriesBurned`

Both models are owner-authorized, so each user only sees their own records.

## Deployment

This app is set up for continuous deployment via AWS Amplify Hosting (see `amplify.yml`). Connect the repository in the Amplify Console to build and deploy on push.

