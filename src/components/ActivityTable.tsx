import React, { useState } from "react";
import { toast } from "react-toastify";
import "./ActivityTable.css";
import ActivityFormRow from "./ActivityFormRow";
import EditableActivityRow from "./EditableActivityRow";
import DetailsFormRow from "./DetailsFormRow";
import { Activity, CreateActivityDto, CreateDetailDto } from "../types";
import { EMPTY_CELL_LABEL } from "../constants/index";

interface ActivityTableProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onUpdate: (id: number, data: CreateActivityDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (data: CreateActivityDto) => Promise<void>;
  editingActivity: Activity | null;
  onCancelEdit: () => void;
  onAddDetail: (
    activityId: number,
    detailData: CreateDetailDto
  ) => Promise<void>;
  onDeleteDetail: (activityId: number, detailId: number) => Promise<void>;
}

function ActivityTable({
  activities,
  onEdit,
  onUpdate,
  onDelete,
  onCreate,
  editingActivity,
  onCancelEdit,
  onAddDetail,
  onDeleteDetail,
}: ActivityTableProps) {
  // Завантажуємо розгорнуті рядки з localStorage
  const loadExpandedRows = (): Set<number> => {
    try {
      const stored = localStorage.getItem("expanded_rows");
      if (stored) {
        const ids = JSON.parse(stored) as number[];
        return new Set(ids);
      }
    } catch (error) {
      console.error("Помилка завантаження розгорнутих рядків:", error);
    }
    return new Set<number>();
  };

  const [expandedRows, setExpandedRows] =
    useState<Set<number>>(loadExpandedRows);

  // Завантажуємо стан сортування з localStorage
  const loadSortOrder = (): "asc" | "desc" | null => {
    try {
      const stored = localStorage.getItem("time_sort_order");
      if (stored === "asc" || stored === "desc") {
        return stored;
      }
    } catch (error) {
      console.error("Помилка завантаження сортування:", error);
    }
    return null;
  };

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(
    loadSortOrder
  );

  const toggleSort = () => {
    const newOrder =
      sortOrder === null ? "asc" : sortOrder === "asc" ? "desc" : null;
    setSortOrder(newOrder);
    try {
      if (newOrder) {
        localStorage.setItem("time_sort_order", newOrder);
      } else {
        localStorage.removeItem("time_sort_order");
      }
    } catch (error) {
      console.error("Помилка збереження сортування:", error);
    }
  };

  // Сортуємо activities за часом
  const sortedActivities = React.useMemo(() => {
    if (!sortOrder) return activities;

    return [...activities].sort((a, b) => {
      const timeA = parseInt(a.hour) * 60 + parseInt(a.minute);
      const timeB = parseInt(b.hour) * 60 + parseInt(b.minute);

      if (sortOrder === "asc") {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });
  }, [activities, sortOrder]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      try {
        const ids = Array.from(newSet);
        localStorage.setItem("expanded_rows", JSON.stringify(ids));
      } catch (error) {
        console.error("Помилка збереження розгорнутих рядків:", error);
      }
      return newSet;
    });
  };

  return (
    <div className="table-container">
      <table className="activity-table">
        <thead>
          <tr>
            <th
              className="sortable-header"
              onClick={toggleSort}
              title={
                sortOrder === "asc"
                  ? "Сортувати за спаданням"
                  : sortOrder === "desc"
                  ? "Прибрати сортування"
                  : "Сортувати за зростанням"
              }
            >
              Час
              {sortOrder === "asc" && <span className="sort-arrow"> ↑</span>}
              {sortOrder === "desc" && <span className="sort-arrow"> ↓</span>}
            </th>
            <th>Кількість</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Напрямок</th>
            <th>Заклад</th>
            <th>Координати</th>
            <th>Стрім</th>
            <th>Відділ</th>
            <th>Посилання</th>
            <th>Коментар</th>
            <th></th>
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
              <td colSpan={12} className="empty-row">
                Немає переміщень. Додайте першу активність вище!
              </td>
            </tr>
          ) : (
            sortedActivities.map((activity) =>
              editingActivity && editingActivity.id === activity.id ? (
                <EditableActivityRow
                  key={activity.id}
                  activity={activity}
                  onSave={onUpdate}
                  onCancel={onCancelEdit}
                />
              ) : (
                <>
                  <tr key={activity.id} className="main-row">
                    <td
                      className="expand-btn"
                      onClick={() => toggleRow(activity.id)}
                    >
                      <div className="time-cell-content">
                        <span className="time-value">
                          {activity.hour}:{activity.minute}
                        </span>
                        <div
                          className="expand-icon"
                          title={
                            expandedRows.has(activity.id)
                              ? "Згорнути"
                              : "Розгорнути"
                          }
                        >
                          {`(${activity.details?.length || 0})`}
                        </div>
                      </div>
                    </td>
                    <td>{activity.participantsCount || EMPTY_CELL_LABEL}</td>
                    <td className="transport-cell">
                      {activity.transportType === "walk"
                        ? "🐷"
                        : activity.transportType === "car"
                        ? "🚗"
                        : EMPTY_CELL_LABEL}
                    </td>
                    <td className="status-cell">
                      {activity.greenCount ||
                      activity.yellowCount ||
                      activity.redCount ? (
                        <div className="status-distribution">
                          {activity.greenCount ? (
                            <span
                              className="status-item status-green"
                              title="Зелений"
                            >
                              {activity.greenCount}●
                            </span>
                          ) : null}
                          {activity.yellowCount ? (
                            <span
                              className="status-item status-yellow"
                              title="Жовтий"
                            >
                              {activity.yellowCount}●
                            </span>
                          ) : null}
                          {activity.redCount ? (
                            <span
                              className="status-item status-red"
                              title="Червоний"
                            >
                              {activity.redCount}●
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        EMPTY_CELL_LABEL
                      )}
                    </td>
                    <td>{activity.direction || EMPTY_CELL_LABEL}</td>
                    <td>{activity.establishment || EMPTY_CELL_LABEL}</td>
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
                      {activity.coordinates || EMPTY_CELL_LABEL}
                    </td>
                    <td>{activity.mainPerson}</td>
                    <td>{activity.department || EMPTY_CELL_LABEL}</td>
                    <td>
                      {activity.link ? (
                        <a
                          href={activity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-btn"
                          title={activity.link}
                        >
                          🔗
                        </a>
                      ) : (
                        EMPTY_CELL_LABEL
                      )}
                    </td>
                    <td>{activity.comment || EMPTY_CELL_LABEL}</td>
                    <td className="action-cell">
                      <button
                        className="delete-btn-corner"
                        onClick={() => onDelete(activity.id)}
                        title="Видалити"
                      >
                        ✕
                      </button>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onEdit(activity)}
                          title="Редагувати"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(activity.id) && (
                    <tr key={`${activity.id}-details`} className="details-row">
                      <td colSpan={12} className="details-cell">
                        <table className="activity-table details-table">
                          <thead>
                            <tr>
                              <th>Час</th>
                              <th>Кількість</th>
                              <th>Статус</th>
                              <th>Координати</th>
                              <th>Стрім</th>
                              <th>Посилання</th>
                              <th>Коментар</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            <DetailsFormRow
                              parentId={activity.id}
                              onSubmit={onAddDetail}
                            />
                            {activity.details && activity.details.length > 0 ? (
                              activity.details.map((detail) => (
                                <tr key={detail.id} className="detail-row">
                                  <td>
                                    {detail.hour}:{detail.minute}
                                  </td>
                                  <td>
                                    {detail.participantsCount ||
                                      EMPTY_CELL_LABEL}
                                  </td>
                                  <td className="status-cell">
                                    {detail.greenCount ||
                                    detail.yellowCount ||
                                    detail.redCount ? (
                                      <div className="status-distribution">
                                        {detail.greenCount ? (
                                          <span
                                            className="status-item status-green"
                                            title="Зелений"
                                          >
                                            {detail.greenCount}●
                                          </span>
                                        ) : null}
                                        {detail.yellowCount ? (
                                          <span
                                            className="status-item status-yellow"
                                            title="Жовтий"
                                          >
                                            {detail.yellowCount}●
                                          </span>
                                        ) : null}
                                        {detail.redCount ? (
                                          <span
                                            className="status-item status-red"
                                            title="Червоний"
                                          >
                                            {detail.redCount}●
                                          </span>
                                        ) : null}
                                      </div>
                                    ) : (
                                      EMPTY_CELL_LABEL
                                    )}
                                  </td>
                                  <td
                                    className={
                                      detail.coordinates
                                        ? "coordinates-clickable"
                                        : ""
                                    }
                                    onClick={
                                      detail.coordinates
                                        ? async () => {
                                            try {
                                              await navigator.clipboard.writeText(
                                                detail.coordinates || ""
                                              );
                                              toast.success(
                                                "Координати скопійовано!"
                                              );
                                            } catch (error) {
                                              console.error(
                                                "Помилка копіювання:",
                                                error
                                              );
                                              const textArea =
                                                document.createElement(
                                                  "textarea"
                                                );
                                              textArea.value =
                                                detail.coordinates || "";
                                              document.body.appendChild(
                                                textArea
                                              );
                                              textArea.select();
                                              document.execCommand("copy");
                                              document.body.removeChild(
                                                textArea
                                              );
                                              toast.success(
                                                "Координати скопійовано!"
                                              );
                                            }
                                          }
                                        : undefined
                                    }
                                  >
                                    {detail.coordinates || EMPTY_CELL_LABEL}
                                  </td>
                                  <td>{detail.mainPerson}</td>
                                  <td>
                                    {detail.link ? (
                                      <a
                                        href={detail.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link-btn"
                                        title={detail.link}
                                      >
                                        🔗
                                      </a>
                                    ) : (
                                      EMPTY_CELL_LABEL
                                    )}
                                  </td>
                                  <td>{detail.comment || EMPTY_CELL_LABEL}</td>
                                  <td className="action-cell">
                                    <button
                                      className="delete-btn-corner"
                                      onClick={() =>
                                        onDeleteDetail(activity.id, detail.id)
                                      }
                                      title="Видалити"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="empty-row">
                                  Немає записів. Додайте перший запис вище!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;
