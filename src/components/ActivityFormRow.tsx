import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./ActivityFormRow.css";
import NameAutocomplete from "./NameAutocomplete";
import EstablishmentAutocomplete from "./EstablishmentAutocomplete";
import { Activity, CreateActivityDto, FormData } from "../types";

interface ActivityFormRowProps {
  onSubmit: (data: CreateActivityDto) => Promise<void>;
  onCancel: (() => void) | null;
  editingActivity: Activity | null;
}

function ActivityFormRow({
  onSubmit,
  onCancel,
  editingActivity,
}: ActivityFormRowProps) {
  // Функція для отримання поточного часу
  const getCurrentTime = (): string => {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  };

  const [formData, setFormData] = useState<FormData>({
    time: getCurrentTime(),
    participantsCount: "",
    transportType: "walk",
    coordinates: "",
    mainPerson: "",
    establishment: "",
    department: "",
    link: "",
    comment: "",
  });

  useEffect(() => {
    if (editingActivity) {
      // Формуємо час у форматі HH:mm для input type="time"
      const timeValue = `${editingActivity.hour || "00"}:${
        editingActivity.minute || "00"
      }`;
      setFormData({
        time: timeValue,
        participantsCount: editingActivity.participantsCount?.toString() || "",
        transportType: editingActivity.transportType || "walk",
        coordinates: editingActivity.coordinates || "",
        mainPerson: editingActivity.mainPerson || "",
        establishment: editingActivity.establishment || "",
        department: editingActivity.department || "",
        link: editingActivity.link || "",
        comment: editingActivity.comment || "",
      });
    } else {
      // Завжди встановлюємо поточний час при відкритті форми для додавання
      setFormData({
        time: getCurrentTime(),
        participantsCount: "",
        transportType: "walk",
        coordinates: "",
        mainPerson: "",
        establishment: "",
        department: "",
        link: "",
        comment: "",
      });
    }
  }, [editingActivity]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleChange(e);
  };

  const handleEstablishmentChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    handleChange(e);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    // Перевірка обов'язкових полів
    if (
      !formData.time ||
      !formData.mainPerson ||
      formData.mainPerson.trim() === ""
    ) {
      alert(
        "Будь ласка, заповніть обов'язкові поля: час та Стрім в активності"
      );
      return;
    }

    // Розділяємо час на годину та хвилину
    const [hour, minute] = formData.time.split(":");

    // Підготовка даних для відправки
    const submitData: CreateActivityDto = {
      hour: hour,
      minute: minute,
      mainPerson: formData.mainPerson.trim(),
      participantsCount: formData.participantsCount
        ? parseInt(formData.participantsCount)
        : null,
      transportType:
        formData.transportType === "walk" || formData.transportType === "car"
          ? formData.transportType
          : null,
      coordinates: formData.coordinates.trim() || null,
      establishment: formData.establishment.trim() || null,
      department:
        formData.department === "літуни" || formData.department === "тіхоні"
          ? formData.department
          : null,
      link: formData.link.trim() || null,
      comment: formData.comment.trim() || null,
    };

    try {
      await onSubmit(submitData);
      if (!editingActivity) {
        // Очищаємо форму після успішного додавання, але зберігаємо поточний час
        setFormData({
          time: getCurrentTime(),
          participantsCount: "",
          transportType: "walk",
          coordinates: "",
          mainPerson: "",
          establishment: "",
          department: "",
          link: "",
          comment: "",
        });
      }
    } catch (error) {
      // Помилка вже оброблена в App.tsx
    }
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    }
    setFormData({
      time: getCurrentTime(),
      participantsCount: "",
      transportType: "walk",
      coordinates: "",
      mainPerson: "",
      establishment: "",
      department: "",
      link: "",
      comment: "",
    });
  };

  const handleRefreshTime = (): void => {
    setFormData((prev) => ({
      ...prev,
      time: getCurrentTime(),
    }));
  };

  // Генеруємо опції для кількості людей (1-10)
  const participantsOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <tr className="form-row">
      <td className="form-cell">
        {editingActivity ? editingActivity.id : "—"}
      </td>
      <td className="form-cell time-cell">
        <div className="time-input-wrapper">
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="form-input time-input"
            required
          />
          <button
            type="button"
            onClick={handleRefreshTime}
            className="btn-time-refresh"
            title="Оновити на поточний час"
          >
            ↻
          </button>
        </div>
      </td>
      <td className="form-cell">
        <select
          name="participantsCount"
          value={formData.participantsCount}
          onChange={handleChange}
          className="form-input form-select"
        >
          <option value="">—</option>
          {participantsOptions.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </td>
      <td className="form-cell transport-cell">
        <select
          name="transportType"
          value={formData.transportType}
          onChange={handleChange}
          className="form-input form-select transport-select"
        >
          <option value="">—</option>
          <option value="walk">🐷</option>
          <option value="car">🚗</option>
        </select>
      </td>
      <td className="form-cell">
        <EstablishmentAutocomplete
          value={formData.establishment}
          onChange={handleEstablishmentChange}
          placeholder="Заклад"
        />
      </td>
      <td className="form-cell">
        <input
          type="text"
          name="coordinates"
          value={formData.coordinates}
          onChange={handleChange}
          placeholder="Координати"
          className="form-input"
        />
      </td>
      <td className="form-cell">
        <NameAutocomplete
          value={formData.mainPerson}
          onChange={handleNameChange}
          placeholder="Стрім"
          required
        />
      </td>
      <td className="form-cell">
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="form-input form-select"
        >
          <option value="">—</option>
          <option value="літуни">Літуни</option>
          <option value="тіхоні">Тіхоні</option>
        </select>
      </td>
      <td className="form-cell">
        <input
          type="url"
          name="link"
          value={formData.link}
          onChange={handleChange}
          placeholder="Посилання"
          className="form-input"
        />
      </td>
      <td className="form-cell">
        <input
          type="text"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Коментар"
          className="form-input"
        />
      </td>
      <td className="form-cell form-actions-cell">
        <div className="form-row-actions">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-success btn-sm"
            title={editingActivity ? "Зберегти" : "Додати"}
          >
            {editingActivity ? "✓" : "+"}
          </button>
          {editingActivity && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary btn-sm"
              title="Скасувати"
            >
              ✕
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ActivityFormRow;
