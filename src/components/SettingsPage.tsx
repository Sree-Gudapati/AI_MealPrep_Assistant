import { UserProfileForm } from "./UserProfileForm";
import { WorkoutLog } from "./WorkoutLog";
import "./SettingsPage.css";

export function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-section">
        <UserProfileForm />
      </div>
      <div className="settings-section">
        <WorkoutLog />
      </div>
    </div>
  );
}
