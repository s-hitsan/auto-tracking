import React from "react";
import { toast } from "react-toastify";
import "./ActivityTable.css";
import ActivityFormRow from "./ActivityFormRow";
import EditableActivityRow from "./EditableActivityRow";
import { Activity, CreateActivityDto } from "../types";

interface ActivityTableProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onUpdate: (id: number, data: CreateActivityDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (data: CreateActivityDto) => Promise<void>;
  editingActivity: Activity | null;
  onCancelEdit: () => void;
}

function ActivityTable({
  activities,
  onEdit,
  onUpdate,
  onDelete,
  onCreate,
  editingActivity,
  onCancelEdit,
}: ActivityTableProps) {
  return (
    <div className="table-container">
      <table className="activity-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Час</th>
            <th>Кількість</th>
            <th>Тип</th>
            <th>Заклад</th>
            <th>Координати</th>
            <th>Стрім</th>
            <th>Відділ</th>
            <th>Посилання</th>
            <th>Коментар</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          <ActivityFormRow
            onSubmit={onCreate}
            onCancel={null}
            editingActivity={null}
          />
          {activities.length === 0 ? (
            <tr>
              <td colSpan={11} className="empty-row">
                Немає переміщень. Додайте першу активність вище!
              </td>
            </tr>
          ) : (
            activities.map((activity) =>
              editingActivity && editingActivity.id === activity.id ? (
                <EditableActivityRow
                  key={activity.id}
                  activity={activity}
                  onSave={onUpdate}
                  onCancel={onCancelEdit}
                />
              ) : (
                <tr key={activity.id}>
                  <td>{activity.id}</td>
                  <td>
                    {activity.hour}:{activity.minute}
                  </td>
                  <td>{activity.participantsCount || "—"}</td>
                  <td className="transport-cell">
                    {activity.transportType === "walk"
                      ? "🐷"
                      : activity.transportType === "car"
                      ? "🚗"
                      : "—"}
                  </td>
                  <td>{activity.establishment || "—"}</td>
                  <td
                    className={
                      activity.coordinates ? "coordinates-clickable" : ""
                    }
                    onClick={
                      activity.coordinates
                        ? async () => {
                            try {
                              await navigator.clipboard.writeText(
                                activity.coordinates || ""
                              );
                              toast.success("Координати скопійовано!");
                            } catch (error) {
                              console.error("Помилка копіювання:", error);
                              // Fallback для старих браузерів
                              const textArea =
                                document.createElement("textarea");
                              textArea.value = activity.coordinates || "";
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);
                              toast.success("Координати скопійовано!");
                            }
                          }
                        : undefined
                    }
                  >
                    {activity.coordinates || "—"}
                  </td>
                  <td>{activity.mainPerson}</td>
                  <td>{activity.department || "—"}</td>
                  <td>
                    {activity.link ? (
                      <a
                        href={activity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-cell"
                      >
                        {activity.link.length > 30
                          ? activity.link.substring(0, 30) + "..."
                          : activity.link}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{activity.comment || "—"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary btn-sm btn-icon"
                        onClick={() => onEdit(activity)}
                        title="Редагувати"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => onDelete(activity.id)}
                        title="Видалити"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;
