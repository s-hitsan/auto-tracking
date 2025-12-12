import { FormData } from "../types";

export const parseActivityFromClipboard = (
  text: string
): Partial<FormData> | null => {
  try {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const parsed: Partial<FormData> = {};
    let participantsCount = "";

    // Спочатку збираємо всі дані
    for (const line of lines) {
      // Посилання
      if (line.startsWith("Посилання:")) {
        const link = line.replace(/^Посилання:\s*/, "").trim();
        if (link) parsed.link = link;
      }
      // Екіпаж → mainPerson (Стрім)
      else if (line.startsWith("Екіпаж:")) {
        const mainPerson = line.replace(/^Екіпаж:\s*/, "").trim();
        if (mainPerson) parsed.mainPerson = mainPerson;
      }
      // Кількість
      else if (line.startsWith("Кількість:")) {
        const count = line.replace(/^Кількість:\s*/, "").trim();
        if (count) {
          participantsCount = count;
          parsed.participantsCount = count;
        }
      }
      // Коментар
      else if (line.startsWith("Коментар:")) {
        const comment = line.replace(/^Коментар:\s*/, "").trim();
        if (comment) parsed.comment = comment;
      }
      // Координати (MGRS)
      else if (line.startsWith("Координати (MGRS):")) {
        const coordinates = line
          .replace(/^Координати \(MGRS\):\s*/, "")
          .trim();
        if (coordinates) parsed.coordinates = coordinates;
      }
      // Дата/час виявлення → час (тільки час, без дати)
      else if (line.startsWith("Дата/час виявлення:")) {
        const dateTime = line.replace(/^Дата\/час виявлення:\s*/, "").trim();
        // Формат: 12.12.2025 15:16:25 → 15:16
        const timeMatch = dateTime.match(/(\d{2}):(\d{2}):\d{2}/);
        if (timeMatch) {
          parsed.time = `${timeMatch[1]}:${timeMatch[2]}`;
        }
      }
      // Тип → transportType
      else if (line.startsWith("Тип:")) {
        const type = line.replace(/^Тип:\s*/, "").trim();
        if (type === "Особовий склад") {
          parsed.transportType = "walk";
        } else {
          parsed.transportType = "car";
        }
      }
      // Боєздатність → статус
      else if (line.startsWith("Боєздатність:")) {
        const combatStatus = line.replace(/^Боєздатність:\s*/, "").trim();
        const count = participantsCount || parsed.participantsCount || "";

        if (count && combatStatus === "Повністю боєздатний") {
          parsed.greenCount = count;
          parsed.yellowCount = "";
          parsed.redCount = "";
        } else if (count && combatStatus === "Частково боєздатний") {
          parsed.greenCount = "";
          parsed.yellowCount = count;
          parsed.redCount = "";
        } else if (count && combatStatus === "Небоєздатний") {
          parsed.greenCount = "";
          parsed.yellowCount = "";
          parsed.redCount = count;
        }
      }
    }

    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch (error) {
    console.error("Помилка парсингу:", error);
    return null;
  }
};

