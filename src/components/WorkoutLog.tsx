import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import "./WorkoutLog.css";

const amplifyClient = generateClient<Schema>();

interface Workout {
  id: string;
  date: string;
  type: string;
  durationMin: number;
  caloriesBurned: number;
}

export function WorkoutLog() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    durationMin: "",
    caloriesBurned: "",
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const { data, errors } = await amplifyClient.models.WorkoutLog.list();
      if (!errors && data) {
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
        setWorkouts(sorted as Workout[]);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.durationMin || !formData.caloriesBurned) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const date: string = formData.date;
      const type: string = formData.type;
      const durationMin: number = parseInt(formData.durationMin, 10);
      const caloriesBurned: number = parseInt(formData.caloriesBurned, 10);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Schema<->create input inference is broken in the installed @aws-amplify/backend + TS 5.9 combo (resolves to `{ [x: string]: string[] }` instead of the real model shape); the runtime call is unaffected.
      await (amplifyClient.models.WorkoutLog as any).create({
        date,
        type,
        durationMin,
        caloriesBurned,
      });

      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "",
        durationMin: "",
        caloriesBurned: "",
      });

      alert("Workout logged successfully!");
      fetchWorkouts();
    } catch (error) {
      console.error("Error adding workout:", error);
      alert("Error adding workout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) {
      return;
    }

    try {
      await amplifyClient.models.WorkoutLog.delete({ id });
      fetchWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Error deleting workout");
    }
  };

  return (
    <div className="workout-container">
      <h2>Workout Log</h2>

      <form onSubmit={handleAddWorkout} className="workout-form">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Workout Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="">Select type</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            value={formData.durationMin}
            onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
            placeholder="e.g., 30"
          />
        </div>

        <div className="form-group">
          <label>Calories Burned</label>
          <input
            type="number"
            value={formData.caloriesBurned}
            onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
            placeholder="e.g., 200"
          />
        </div>

        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? "Adding..." : "Add Workout"}
        </button>
      </form>

      <div className="workouts-list">
        <h3>Recent Workouts</h3>
        {loading ? (
          <p>Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <p>No workouts logged yet.</p>
        ) : (
          <table className="workouts-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Duration (min)</th>
                <th>Calories</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((workout) => (
                <tr key={workout.id}>
                  <td>{new Date(workout.date).toLocaleDateString()}</td>
                  <td className="capitalize">{workout.type}</td>
                  <td>{workout.durationMin}</td>
                  <td>{workout.caloriesBurned}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
