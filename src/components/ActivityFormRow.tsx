import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import "./ActivityFormRow.css";
import NameAutocomplete from "./NameAutocomplete";
import EstablishmentAutocomplete from "./EstablishmentAutocomplete";
import StatusSelectorPopup from "./StatusSelectorPopup";
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
    greenCount: "",
    yellowCount: "",
    redCount: "",
    direction: "",
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
        greenCount: editingActivity.greenCount?.toString() || "",
        yellowCount: editingActivity.yellowCount?.toString() || "",
        redCount: editingActivity.redCount?.toString() || "",
        direction: editingActivity.direction || "",
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
        greenCount: "",
        yellowCount: "",
        redCount: "",
        direction: "",
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
    if (!formData.time) {
      alert("Будь ласка, заповніть обов'язкові поля: час в активності");
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
      greenCount: formData.greenCount ? parseInt(formData.greenCount) : null,
      yellowCount: formData.yellowCount ? parseInt(formData.yellowCount) : null,
      redCount: formData.redCount ? parseInt(formData.redCount) : null,
      direction:
        formData.direction === "+" ||
        formData.direction === "-" ||
        formData.direction === "="
          ? formData.direction
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
          greenCount: "",
          yellowCount: "",
          redCount: "",
          direction: "",
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
      greenCount: "",
      yellowCount: "",
      redCount: "",
      direction: "",
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

  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [clipboardLink, setClipboardLink] = useState<string>("");

  const handleCheckClipboard = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardLink(text);
    } catch (error) {
      setClipboardLink("");
    }
  };

  // Перевіряємо буфер обміну при завантаженні та коли змінюється formData.link
  useEffect(() => {
    handleCheckClipboard();
  }, [formData.link]);

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handlePasteLink = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      if (!isValidUrl(text)) {
        toast.error(`"${text}" не є валідним посиланням!`);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        link: text,
      }));
      toast.success(`Посилання "${text}" успішно вставлено!`);
    } catch (error) {
      // Fallback для старих браузерів
      const textArea = document.createElement("textarea");
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        if (document.execCommand("paste")) {
          const text = textArea.value;
          if (!isValidUrl(text)) {
            toast.error(`"${text}" не є валідним посиланням!`);
            document.body.removeChild(textArea);
            return;
          }
          setFormData((prev) => ({
            ...prev,
            link: text,
          }));
          toast.success(`Посилання "${text}" успішно вставлено!`);
        }
      } catch (err) {
        console.error("Помилка читання з буфера обміну:", err);
        toast.error("Помилка вставки з буфера обміну");
      }
      document.body.removeChild(textArea);
    }
  };

  // Генеруємо опції для кількості людей (1-10)
  const participantsOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <tr className="form-row">
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
      <td className="form-cell status-cell">
        <div
          className={`status-trigger ${
            formData.greenCount || formData.yellowCount || formData.redCount
              ? "has-status"
              : ""
          }`}
          onClick={() => setShowStatusPopup(true)}
        >
          <div className="status-trigger-content">
            {formData.greenCount ||
            formData.yellowCount ||
            formData.redCount ? (
              <>
                {formData.greenCount && (
                  <span className="status-trigger-item status-green">
                    {formData.greenCount}●
                  </span>
                )}
                {formData.yellowCount && (
                  <span className="status-trigger-item status-yellow">
                    {formData.yellowCount}●
                  </span>
                )}
                {formData.redCount && (
                  <span className="status-trigger-item status-red">
                    {formData.redCount}●
                  </span>
                )}
              </>
            ) : (
              <span>Вибрати</span>
            )}
          </div>
        </div>
        {showStatusPopup && (
          <StatusSelectorPopup
            greenCount={formData.greenCount}
            yellowCount={formData.yellowCount}
            redCount={formData.redCount}
            onGreenChange={(value) =>
              setFormData((prev) => ({ ...prev, greenCount: value }))
            }
            onYellowChange={(value) =>
              setFormData((prev) => ({ ...prev, yellowCount: value }))
            }
            onRedChange={(value) =>
              setFormData((prev) => ({ ...prev, redCount: value }))
            }
            onClose={() => setShowStatusPopup(false)}
            participantsOptions={participantsOptions}
          />
        )}
      </td>
      <td className="form-cell">
        <select
          name="direction"
          value={formData.direction}
          onChange={handleChange}
          className="form-input form-select"
        >
          <option value="">—</option>
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="=">=</option>
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
        <input type="hidden" name="link" value={formData.link} />
        <button
          type="button"
          className={`btn-paste-link ${
            (clipboardLink && isValidUrl(clipboardLink)) ||
            (formData.link && isValidUrl(formData.link))
              ? "has-link"
              : ""
          }`}
          onClick={handlePasteLink}
          onMouseEnter={handleCheckClipboard}
          title={
            clipboardLink
              ? `Вставити: ${clipboardLink}`
              : formData.link
              ? `Посилання: ${formData.link}`
              : "Вставити з буфера обміну"
          }
        >
          📋
        </button>
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
