import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import "./UserProfileForm.css";

const amplifyClient = generateClient<Schema>();

interface ProfileFormState {
  id: string;
  age: string;
  weightKg: string;
  heightCm: string;
  activityLevel: string;
  fitnessGoal: string;
  dietaryRestrictions: string;
}

const emptyForm: ProfileFormState = {
  id: "",
  age: "",
  weightKg: "",
  heightCm: "",
  activityLevel: "",
  fitnessGoal: "",
  dietaryRestrictions: "",
};

export function UserProfileForm() {
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          weightKg: p.weightKg?.toString() ?? "",
          heightCm: p.heightCm?.toString() ?? "",
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
    setSaving(true);
    try {
      const dietaryRestrictions = form.dietaryRestrictions
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const age = form.age ? parseInt(form.age, 10) : undefined;
      const weightKg = form.weightKg ? parseFloat(form.weightKg) : undefined;
      const heightCm = form.heightCm ? parseFloat(form.heightCm) : undefined;
      const activityLevel = form.activityLevel || undefined;
      const fitnessGoal = form.fitnessGoal || undefined;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Schema<->create/update input inference is broken in the installed @aws-amplify/backend + TS 5.9 combo (resolves to `{ [x: string]: string[] }` instead of the real model shape); the runtime call is unaffected.
      const client = amplifyClient.models.UserProfile as any;
      if (form.id) {
        await client.update({
          id: form.id,
          age,
          weightKg,
          heightCm,
          activityLevel,
          fitnessGoal,
          dietaryRestrictions,
        });
      } else {
        await client.create({
          age,
          weightKg,
          heightCm,
          activityLevel,
          fitnessGoal,
          dietaryRestrictions,
        });
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
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="e.g., 25"
          />
        </div>

        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
            placeholder="e.g., 70.5"
          />
        </div>

        <div className="form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            value={form.heightCm}
            onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
            placeholder="e.g., 180"
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
            placeholder="e.g., vegetarian, gluten-free, dairy-free"
          />
        </div>

        <button type="submit" disabled={saving} className="submit-btn">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
