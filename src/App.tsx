import { useState, type FormEvent } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { UserProfileForm } from "./components/UserProfileForm";
import { WorkoutLog } from "./components/WorkoutLog";

Amplify.configure(outputs);
const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

type Page = "recipe" | "profile" | "workout";

async function buildUserContext(): Promise<string> {
  try {
    const { data: profiles } = await amplifyClient.models.UserProfile.list();
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split("T")[0];

    const { data: allWorkouts } = await amplifyClient.models.WorkoutLog.list();
    const recentWorkouts = (allWorkouts || []).filter(
      (w) => w.date >= threeMonthsAgoStr
    );

    if (!profile && recentWorkouts.length === 0) {
      return "";
    }

    let context = "";

    if (profile) {
      const parts: string[] = [];
      if (profile.age) parts.push(`Age: ${profile.age}`);
      if (profile.heightIn) parts.push(`Height: ${profile.heightIn}in`);
      if (profile.weightLbs) parts.push(`Weight: ${profile.weightLbs}lbs`);
      if (profile.activityLevel) parts.push(`Activity Level: ${profile.activityLevel}`);
      if (profile.fitnessGoal) parts.push(`Fitness Goal: ${profile.fitnessGoal}`);
      if (parts.length > 0) {
        context += parts.join(", ") + ".\n";
      }
      if (profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) {
        context += `Dietary Restrictions: ${profile.dietaryRestrictions.join(", ")}.\n`;
      }
    }

    if (recentWorkouts.length > 0) {
      const workoutsByType: Record<string, number> = {};
      let totalDuration = 0;
      let totalCalories = 0;

      recentWorkouts.forEach((w) => {
        if (w.type) {
          workoutsByType[w.type] = (workoutsByType[w.type] || 0) + 1;
        }
        totalDuration += w.durationMin || 0;
        totalCalories += w.caloriesBurned || 0;
      });

      const typeSummary = Object.entries(workoutsByType)
        .map(([type, count]) => `${count}x ${type}`)
        .join(", ");

      context += `Recent Activity (last 3 months): ${recentWorkouts.length} workouts (${typeSummary}). `;
      context += `Total duration: ${totalDuration} minutes, total calories burned: ${totalCalories}.\n`;
    }

    return context;
  } catch (error) {
    console.error("Error building user context:", error);
    return "";
  }
}

function RecipePage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const userContext = await buildUserContext();
      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients: [formData.get("ingredients")?.toString() || ""],
        userContext,
      });
      if (!errors) {
        setResult(data?.body || "No data returned");
      } else {
        console.log(errors);
      }
    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new
          recipe on
          demand. Set up your profile and workout log for personalized
          recommendations tailored to your fitness goals.
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </>
  );
}

function App() {
  const [page, setPage] = useState<Page>("recipe");

  return (
    <div className="app-container">
      <nav className="main-nav">
        <button
          className={`nav-btn ${page === "recipe" ? "active" : ""}`}
          onClick={() => setPage("recipe")}
        >
          Recipe Generator
        </button>
        <button
          className={`nav-btn ${page === "profile" ? "active" : ""}`}
          onClick={() => setPage("profile")}
        >
          Profile Setup
        </button>
        <button
          className={`nav-btn ${page === "workout" ? "active" : ""}`}
          onClick={() => setPage("workout")}
        >
          Workout Log
        </button>
      </nav>

      {page === "recipe" && <RecipePage />}
      {page === "profile" && <UserProfileForm />}
      {page === "workout" && <WorkoutLog />}
    </div>
  );
}
export default App;
