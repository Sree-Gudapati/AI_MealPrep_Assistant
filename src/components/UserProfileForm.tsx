import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";
import "./UserProfileForm.css";

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

interface ProfileFormState {
  id: string;
  age: string;
  weightLbs: string;
  heightIn: string;
  activityLevel: string;
  fitnessGoal: string;
  dietaryRestrictions: string;
}

const emptyForm: ProfileFormState = {
  id: "",
  age: "",
  weightLbs: "",
  heightIn: "",
  activityLevel: "",
  fitnessGoal: "",
  dietaryRestrictions: "",
};

interface UserProfileMutationInput {
  age?: number;
  weightLbs?: number;
  heightIn?: number;
  activityLevel?: string;
  fitnessGoal?: string;
  dietaryRestrictions: string[];
}

interface UserProfileMutationResult {
  data: unknown;
  errors?: { message: string }[];
}

interface UserProfileMutationClient {
  create: (input: UserProfileMutationInput & { id: string }) => Promise<UserProfileMutationResult>;
  update: (input: UserProfileMutationInput & { id: string }) => Promise<UserProfileMutationResult>;
}

const AGE_MIN = 1;
const AGE_MAX = 120;
const WEIGHT_LB_MIN = 2;
const WEIGHT_LB_MAX = 1100;
const HEIGHT_IN_MIN = 12;
const HEIGHT_IN_MAX = 98;

function validateNumericFields(
  age: number | undefined,
  weightLbs: number | undefined,
  heightIn: number | undefined
): string | null {
  if (age !== undefined && (Number.isNaN(age) || age < AGE_MIN || age > AGE_MAX)) {
    return `Age must be between ${AGE_MIN} and ${AGE_MAX}.`;
  }
  if (
    weightLbs !== undefined &&
    (Number.isNaN(weightLbs) || weightLbs < WEIGHT_LB_MIN || weightLbs > WEIGHT_LB_MAX)
  ) {
    return `Weight must be between ${WEIGHT_LB_MIN} and ${WEIGHT_LB_MAX} lbs.`;
  }
  if (
    heightIn !== undefined &&
    (Number.isNaN(heightIn) || heightIn < HEIGHT_IN_MIN || heightIn > HEIGHT_IN_MAX)
  ) {
    return `Height must be between ${HEIGHT_IN_MIN} and ${HEIGHT_IN_MAX} inches.`;
  }
  return null;
}

export function UserProfileForm() {
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, errors } = await amplifyClient.models.UserProfile.list();
      if (!errors && data && data.length > 0) {
        const p = data[0];
        setForm({
          id: p.id,
          age: p.age?.toString() ?? "",
          weightLbs: p.weightLbs?.toString() ?? "",
          heightIn: p.heightIn?.toString() ?? "",
          activityLevel: p.activityLevel ?? "",
          fitnessGoal: p.fitnessGoal ?? "",
          dietaryRestrictions: p.dietaryRestrictions?.join(", ") ?? "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dietaryRestrictions = form.dietaryRestrictions
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const age = form.age ? parseInt(form.age, 10) : undefined;
    const weightLbs = form.weightLbs ? parseFloat(form.weightLbs) : undefined;
    const heightIn = form.heightIn ? parseFloat(form.heightIn) : undefined;
    const activityLevel = form.activityLevel || undefined;
    const fitnessGoal = form.fitnessGoal || undefined;

    const validationError = validateNumericFields(age, weightLbs, heightIn);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      // Schema<->create/update input inference is broken in the installed @aws-amplify/backend + TS 5.9 combo
      // (resolves to `{ [x: string]: string[] }` instead of the real model shape); the runtime call is unaffected.
      // Cast through UserProfileMutationClient instead of `any` so a typo'd/renamed field here still fails to compile.
      const client = amplifyClient.models.UserProfile as unknown as UserProfileMutationClient;
      // Explicit annotation (not inferred) so an excess/typo'd property here still fails to
      // compile, even though it's assigned to an intermediate variable rather than passed
      // directly as a call argument.
      const mutationFields: UserProfileMutationInput = {
        age,
        weightLbs,
        heightIn,
        activityLevel,
        fitnessGoal,
        dietaryRestrictions,
      };

      if (form.id) {
        const { errors } = await client.update({ id: form.id, ...mutationFields });
        if (errors && errors.length > 0) {
          throw new Error(errors.map((err) => err.message).join("; "));
        }
      } else {
        // Use the owner's own stable identity id as the profile's id, instead of letting
        // the backend assign a random one. This makes create() idempotent per owner: if a
        // concurrent submit (double-click, second tab) already created this row first,
        // create() fails and we fall back to update() on the same id, converging on one row.
        const { userId } = await getCurrentUser();
        const createResult = await client.create({ id: userId, ...mutationFields });
        if (createResult.errors && createResult.errors.length > 0) {
          const { errors } = await client.update({ id: userId, ...mutationFields });
          if (errors && errors.length > 0) {
            throw new Error(errors.map((err) => err.message).join("; "));
          }
        }
      }

      alert("Profile saved successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="form-container">Loading profile...</div>;
  }

  return (
    <div className="form-container">
      <h2>User Profile</h2>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Age, e.g., 25"
          />
        </div>

        <div className="form-group">
          <label>Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            value={form.weightLbs}
            onChange={(e) => setForm({ ...form, weightLbs: e.target.value })}
            placeholder="Weight (lbs) e.g., 155"
          />
        </div>

        <div className="form-group">
          <label>Height (inches)</label>
          <input
            type="number"
            value={form.heightIn}
            onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
            placeholder="Height (inches) e.g., 71"
          />
        </div>

        <div className="form-group">
          <label>Activity Level</label>
          <select
            value={form.activityLevel}
            onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
          >
            <option value="">Select activity level</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very-active">Very Active</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fitness Goal</label>
          <select
            value={form.fitnessGoal}
            onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}
          >
            <option value="">Select fitness goal</option>
            <option value="cut">Cut (Lose Weight)</option>
            <option value="bulk">Bulk (Gain Muscle)</option>
            <option value="maintain">Maintain</option>
          </select>
        </div>

        <div className="form-group">
          <label>Dietary Restrictions (comma-separated)</label>
          <input
            type="text"
            value={form.dietaryRestrictions}
            onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })}
            placeholder="Dietery Restrictions e.g., vegetarian, gluten-free, dairy-free"
          />
        </div>

        <button type="submit" disabled={saving} className="submit-btn">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
