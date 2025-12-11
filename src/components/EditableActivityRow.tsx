import React, { useState, ChangeEvent } from "react";
import "./ActivityFormRow.css";
import NameAutocomplete from "./NameAutocomplete";
import EstablishmentAutocomplete from "./EstablishmentAutocomplete";
import { Activity, CreateActivityDto, FormData } from "../types";

interface EditableActivityRowProps {
  activity: Activity;
  onSave: (id: number, data: CreateActivityDto) => Promise<void>;
  onCancel: () => void;
}

function EditableActivityRow({
  activity,
  onSave,
  onCancel,
}: EditableActivityRowProps) {
  const [formData, setFormData] = useState<FormData>({
    time: `${activity.hour || "00"}:${activity.minute || "00"}`,
    participantsCount: activity.participantsCount?.toString() || "",
    transportType: activity.transportType || "walk",
    coordinates: activity.coordinates || "",
    mainPerson: activity.mainPerson || "",
    establishment: activity.establishment || "",
    department: activity.department || "",
    link: activity.link || "",
    comment: activity.comment || "",
  });

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

  const handleEstablishmentChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleChange(e);
  };

  const handleSave = async (): Promise<void> => {
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
      await onSave(activity.id, submitData);
    } catch (error) {
      // Помилка вже оброблена в App.tsx
    }
  };

  // Генеруємо опції для кількості людей (1-10)
  const participantsOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <tr className="form-row editing-row">
      <td className="form-cell">{activity.id}</td>
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
            onClick={handleSave}
            className="btn btn-success btn-sm"
            title="Зберегти"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary btn-sm"
            title="Скасувати"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

export default EditableActivityRow;

