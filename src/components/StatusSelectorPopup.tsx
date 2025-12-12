import React, { useEffect, useRef } from "react";
import "./StatusSelectorPopup.css";

interface StatusSelectorPopupProps {
  greenCount: string;
  yellowCount: string;
  redCount: string;
  onGreenChange: (value: string) => void;
  onYellowChange: (value: string) => void;
  onRedChange: (value: string) => void;
  onClose: () => void;
  participantsOptions: number[];
}

function StatusSelectorPopup({
  greenCount,
  yellowCount,
  redCount,
  onGreenChange,
  onYellowChange,
  onRedChange,
  onClose,
  participantsOptions,
}: StatusSelectorPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="status-popup-overlay">
      <div className="status-popup" ref={popupRef}>
        <div className="status-popup-header">
          <h3>Вибір статусів</h3>
          <button
            className="status-popup-close"
            onClick={onClose}
            title="Закрити"
          >
            ✕
          </button>
        </div>
        <div className="status-popup-content">
          <div className="status-popup-item">
            <label className="status-label status-green-label">
              <span className="status-emoji">🟢</span> Зелений:
            </label>
            <select
              value={greenCount}
              onChange={(e) => onGreenChange(e.target.value)}
              className="form-input form-select status-popup-select status-green-select"
            >
              <option value="">—</option>
              {participantsOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
          <div className="status-popup-item">
            <label className="status-label status-yellow-label">
              <span className="status-emoji">🟡</span> Жовтий:
            </label>
            <select
              value={yellowCount}
              onChange={(e) => onYellowChange(e.target.value)}
              className="form-input form-select status-popup-select status-yellow-select"
            >
              <option value="">—</option>
              {participantsOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
          <div className="status-popup-item">
            <label className="status-label status-red-label">
              <span className="status-emoji">🔴</span> Червоний:
            </label>
            <select
              value={redCount}
              onChange={(e) => onRedChange(e.target.value)}
              className="form-input form-select status-popup-select status-red-select"
            >
              <option value="">—</option>
              {participantsOptions.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="status-popup-footer">
          <button className="btn btn-success btn-sm" onClick={onClose}>
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusSelectorPopup;
