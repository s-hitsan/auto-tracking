import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import ActivityTable from "./components/ActivityTable";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  downloadMarkdown,
} from "./services/activityService";
import { Activity, CreateActivityDto } from "./types";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEstablishmentStats, setShowEstablishmentStats] =
    useState<boolean>(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error("Помилка завантаження переміщень:", error);
      alert("Помилка завантаження даних");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (
    activityData: CreateActivityDto
  ): Promise<void> => {
    try {
      await createActivity(activityData);
      await loadActivities();
    } catch (error) {
      console.error("Помилка створення активності:", error);
      alert("Помилка створення активності");
    }
  };

  const handleUpdate = async (
    id: number,
    activityData: CreateActivityDto
  ): Promise<void> => {
    try {
      await updateActivity(id, activityData);
      await loadActivities();
      setEditingActivity(null);
    } catch (error) {
      console.error("Помилка оновлення активності:", error);
      alert("Помилка оновлення активності");
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Ви впевнені, що хочете видалити цю активність?")) {
      try {
        await deleteActivity(id);
        await loadActivities();
      } catch (error) {
        console.error("Помилка видалення активності:", error);
        alert("Помилка видалення активності");
      }
    }
  };

  const handleEdit = (activity: Activity): void => {
    setEditingActivity(activity);
  };

  const handleUpdateFromForm = async (
    id: number,
    activityData: CreateActivityDto
  ): Promise<void> => {
    await handleUpdate(id, activityData);
  };

  const handleCancelEdit = (): void => {
    setEditingActivity(null);
  };

  const handleExport = async (): Promise<void> => {
    try {
      await downloadMarkdown();
    } catch (error) {
      console.error("Помилка експорту:", error);
      alert("Помилка експорту даних");
    }
  };

  // Розрахунок статистики
  const totalActivities = activities.length;
  const totalPeopleByCar = activities.reduce((sum, activity) => {
    if (activity.transportType === "car") {
      return sum + (activity.participantsCount || 0);
    }
    return sum;
  }, 0);
  const totalPeopleByWalk = activities.reduce((sum, activity) => {
    if (activity.transportType === "walk") {
      return sum + (activity.participantsCount || 0);
    }
    return sum;
  }, 0);

  // Статистика по закладах (тільки пішки)
  const establishmentStats = activities
    .filter(
      (activity) => activity.transportType === "walk" && activity.establishment
    )
    .reduce((acc, activity) => {
      const establishment = activity.establishment || "";
      if (!acc[establishment]) {
        acc[establishment] = {
          events: 0,
          people: 0,
        };
      }
      acc[establishment].events += 1;
      acc[establishment].people += activity.participantsCount || 0;
      return acc;
    }, {} as Record<string, { events: number; people: number }>);

  const establishmentStatsArray = Object.entries(establishmentStats)
    .map(([establishment, stats]) => ({
      establishment,
      ...stats,
    }))
    .sort((a, b) => b.events - a.events);

  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <header className="App-header">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Переміщень:</span>
            <span className="stat-value">{totalActivities}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🚗:</span>
            <span className="stat-value">{totalPeopleByCar}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🐷:</span>
            <span className="stat-value">{totalPeopleByWalk}</span>
          </div>
          {establishmentStatsArray.length > 0 && (
            <div className="stat-item establishment-stats">
              <div
                className="stat-label establishment-toggle"
                onClick={() =>
                  setShowEstablishmentStats(!showEstablishmentStats)
                }
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <span>Заклади (🐷):</span>
                <span className="toggle-icon">
                  {showEstablishmentStats ? "▼" : "▶"}
                </span>
              </div>
              {showEstablishmentStats && (
                <div className="establishment-list">
                  {establishmentStatsArray.map((stat) => (
                    <div
                      key={stat.establishment}
                      className="establishment-stat-item"
                    >
                      <span className="establishment-name">
                        {stat.establishment}:
                      </span>
                      <span className="establishment-values">
                        {stat.events} подій, {stat.people} 🐷
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary export-btn"
          onClick={handleExport}
          title="Експортувати в Markdown"
        >
          📥 Експортувати
        </button>
      </header>
      <main className="App-main">
        <div className="container">
          {loading ? (
            <div className="loading">Завантаження...</div>
          ) : (
            <ActivityTable
              activities={activities}
              onEdit={handleEdit}
              onUpdate={handleUpdateFromForm}
              onDelete={handleDelete}
              onCreate={handleCreate}
              editingActivity={editingActivity}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
