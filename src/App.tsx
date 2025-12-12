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
  copyMarkdownToClipboard,
  addDetailToActivity,
  deleteDetailFromActivity,
} from "./services/activityService";
import { toast } from "react-toastify";
import { Activity, CreateActivityDto, CreateDetailDto } from "./types";
import { parseActivityFromClipboard } from "./utils/parseActivity";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDetailedStats, setShowDetailedStats] = useState<boolean>(false);
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

  const handleAddDetail = async (
    activityId: number,
    detailData: CreateDetailDto
  ): Promise<void> => {
    try {
      await addDetailToActivity(activityId, detailData);
      await loadActivities();
    } catch (error) {
      console.error("Помилка додавання деталі:", error);
      alert("Помилка додавання деталі");
    }
  };

  const handleDeleteDetail = async (
    activityId: number,
    detailId: number
  ): Promise<void> => {
    try {
      await deleteDetailFromActivity(activityId, detailId);
      await loadActivities();
    } catch (error) {
      console.error("Помилка видалення деталі:", error);
      alert("Помилка видалення деталі");
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      await copyMarkdownToClipboard();
      toast.success("Markdown скопійовано в буфер обміну!");
    } catch (error) {
      console.error("Помилка копіювання:", error);
      toast.error("Помилка копіювання в буфер обміну");
    }
  };

  const handlePasteActivity = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseActivityFromClipboard(text);

      if (!parsed) {
        toast.error("Не вдалося розпізнати формат події з буфера обміну");
        return;
      }

      // Конвертуємо FormData в CreateActivityDto
      const [hour, minute] = (parsed.time || "00:00").split(":");
      const activityData: CreateActivityDto = {
        hour: hour || "00",
        minute: minute || "00",
        mainPerson: parsed.mainPerson?.trim() || "",
        participantsCount: parsed.participantsCount
          ? parseInt(parsed.participantsCount)
          : 1,
        transportType:
          parsed.transportType === "walk" || parsed.transportType === "car"
            ? parsed.transportType
            : null,
        greenCount: parsed.greenCount ? parseInt(parsed.greenCount) : null,
        yellowCount: parsed.yellowCount ? parseInt(parsed.yellowCount) : null,
        redCount: parsed.redCount ? parseInt(parsed.redCount) : null,
        direction:
          parsed.direction === "+" ||
          parsed.direction === "-" ||
          parsed.direction === "="
            ? parsed.direction
            : null,
        coordinates: parsed.coordinates?.trim() || null,
        establishment: parsed.establishment?.trim() || null,
        department:
          parsed.department === "літуни" || parsed.department === "тіхоні"
            ? parsed.department
            : null,
        link: parsed.link?.trim() || null,
        comment: parsed.comment?.trim() || null,
      };

      // Перевірка обов'язкових полів
      if (!activityData.mainPerson) {
        toast.error("Помилка: відсутнє поле 'Стрім' (Екіпаж)");
        return;
      }

      await handleCreate(activityData);
      toast.success("Подію успішно вставлено з буфера обміну!");
    } catch (error) {
      console.error("Помилка вставки події:", error);
      toast.error("Помилка вставки події з буфера обміну");
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

  // Статистика напрямків (загальна)
  const directionStats = activities.reduce(
    (acc, activity) => {
      if (activity.direction === "+") {
        acc.plus += 1;
      } else if (activity.direction === "-") {
        acc.minus += 1;
      } else if (activity.direction === "=") {
        acc.equals += 1;
      }
      return acc;
    },
    { plus: 0, minus: 0, equals: 0 }
  );

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
          directions: { plus: 0, minus: 0, equals: 0 },
        };
      }
      acc[establishment].events += 1;
      acc[establishment].people += activity.participantsCount || 0;
      if (activity.direction === "+") {
        acc[establishment].directions.plus += 1;
      } else if (activity.direction === "-") {
        acc[establishment].directions.minus += 1;
      } else if (activity.direction === "=") {
        acc[establishment].directions.equals += 1;
      }
      return acc;
    }, {} as Record<string, { events: number; people: number; directions: { plus: number; minus: number; equals: number } }>);

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
          <div
            className="stat-item stat-label stat-toggle"
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => setShowDetailedStats(!showDetailedStats)}
          >
            <span className="stat-label">Переміщень:</span>
            <span className="stat-value">{totalActivities}</span>
            <span className="toggle-icon">{showDetailedStats ? "▼" : "▶"}</span>
          </div>
          <div className="stat-item">
            {showDetailedStats && (
              <div className="detailed-stats">
                <div className="stat-item">
                  <span className="stat-label">🚗:</span>
                  <span className="stat-value">{totalPeopleByCar}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🐷:</span>
                  <span className="stat-value">{totalPeopleByWalk}</span>
                </div>
                <div className="stat-item direction-stats">
                  <span className="stat-label">Напрямки:</span>
                  <div className="direction-values">
                    <span className="direction-item">
                      <span className="direction-symbol">+</span>
                      <span className="stat-value">{directionStats.plus}</span>
                    </span>
                    <span className="direction-item">
                      <span className="direction-symbol">-</span>
                      <span className="stat-value">{directionStats.minus}</span>
                    </span>
                    <span className="direction-item">
                      <span className="direction-symbol">=</span>
                      <span className="stat-value">
                        {directionStats.equals}
                      </span>
                    </span>
                  </div>
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
                            <div className="establishment-header">
                              <span className="establishment-name">
                                {stat.establishment}:
                              </span>
                              <span className="establishment-values">
                                {stat.events} подій, {stat.people} 🐷
                              </span>
                            </div>
                            <div className="establishment-directions">
                              <span className="direction-item">
                                <span className="direction-symbol">+</span>
                                <span>{stat.directions.plus}</span>
                              </span>
                              <span className="direction-item">
                                <span className="direction-symbol">-</span>
                                <span>{stat.directions.minus}</span>
                              </span>
                              <span className="direction-item">
                                <span className="direction-symbol">=</span>
                                <span>{stat.directions.equals}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-success paste-activity-btn"
            onClick={handlePasteActivity}
            title="Вставити подію з буфера обміну"
          >
            📥 Вставити подію
          </button>
          <button
            className="btn btn-primary export-btn"
            onClick={handleExport}
            title="Експортувати в Markdown"
          >
            📥 Експортувати
          </button>
        </div>
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
              onAddDetail={handleAddDetail}
              onDeleteDetail={handleDeleteDetail}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
