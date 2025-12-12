import { Activity, CreateActivityDto, CreateDetailDto, DetailItem } from '../types';

const STORAGE_KEY = 'company_activities';

// Перераховуємо ID активностей
const renumberActivities = (activities: Activity[]): Activity[] => {
  return activities.map((activity, index) => ({
    ...activity,
    id: index + 1,
  }));
};

// Перераховуємо ID деталей в активності
const renumberDetails = (details: DetailItem[]): DetailItem[] => {
  return details.map((detail, index) => ({
    ...detail,
    id: index + 1,
  }));
};

// Отримуємо всі активності з localStorage
export const getActivities = async (): Promise<Activity[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const activities = stored ? JSON.parse(stored) : [];
    // Ініціалізуємо поле details для старих записів та сортуємо деталі
    const processedActivities = activities.map((activity: Activity) => ({
      ...activity,
      details: activity.details ? [...activity.details].sort((a: DetailItem, b: DetailItem) => b.id - a.id) : [],
    }));
    // Сортуємо від нових до старих (за id, більший id = новіший)
    return processedActivities.sort((a: Activity, b: Activity) => b.id - a.id);
  } catch {
    return [];
  }
};

// Отримуємо активність за ID
export const getActivity = async (id: number): Promise<Activity | null> => {
  const activities = await getActivities();
  return activities.find(a => a.id === id) || null;
};

// Створюємо нову активність
export const createActivity = async (activityData: CreateActivityDto): Promise<Activity> => {
  const activities = await getActivities();
  const newId = activities.length > 0 
    ? Math.max(...activities.map(a => a.id)) + 1 
    : 1;
  
  const newActivity: Activity = {
    id: newId,
    ...activityData,
    details: [],
  };
  
  activities.push(newActivity);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  return newActivity;
};

// Оновлюємо активність
export const updateActivity = async (id: number, activityData: CreateActivityDto): Promise<Activity> => {
  const activities = await getActivities();
  const index = activities.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error(`Activity with id ${id} not found`);
  }
  
  activities[index] = {
    ...activities[index],
    ...activityData,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  return activities[index];
};

// Видаляємо активність
export const deleteActivity = async (id: number): Promise<void> => {
  const activities = await getActivities();
  const filtered = activities.filter(a => a.id !== id);
  // Перераховуємо ID після видалення
  const renumbered = renumberActivities(filtered);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(renumbered));
};

// Додаємо деталь до активності
export const addDetailToActivity = async (activityId: number, detailData: CreateDetailDto): Promise<DetailItem> => {
  const activities = await getActivities();
  const activityIndex = activities.findIndex(a => a.id === activityId);
  
  if (activityIndex === -1) {
    throw new Error(`Activity with id ${activityId} not found`);
  }
  
  const activity = activities[activityIndex];
  if (!activity.details) {
    activity.details = [];
  }
  
  // Новий ID = максимальний ID + 1 (або 1, якщо немає деталей)
  const newDetailId = activity.details.length > 0
    ? Math.max(...activity.details.map(d => d.id)) + 1
    : 1;
  
  const newDetail: DetailItem = {
    id: newDetailId,
    ...detailData,
  };
  
  activity.details.push(newDetail);
  // Сортуємо деталі від нових до старих
  activity.details.sort((a, b) => b.id - a.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  return newDetail;
};

// Видаляємо деталь з активності
export const deleteDetailFromActivity = async (activityId: number, detailId: number): Promise<void> => {
  const activities = await getActivities();
  const activityIndex = activities.findIndex(a => a.id === activityId);
  
  if (activityIndex === -1) {
    throw new Error(`Activity with id ${activityId} not found`);
  }
  
  const activity = activities[activityIndex];
  if (activity.details) {
    activity.details = activity.details.filter(d => d.id !== detailId);
    // Перераховуємо ID деталей після видалення
    activity.details = renumberDetails(activity.details);
    // Сортуємо деталі від нових до старих
    activity.details.sort((a, b) => b.id - a.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }
};

// Отримуємо унікальні імена головних осіб
export const getUniqueMainPersons = async (): Promise<string[]> => {
  const activities = await getActivities();
  const uniqueNames = Array.from(new Set(activities.map(a => a.mainPerson).filter(Boolean)));
  return uniqueNames.sort();
};

// Отримуємо унікальні назви закладів
export const getUniqueEstablishments = async (): Promise<string[]> => {
  const activities = await getActivities();
  const uniqueEstablishments = Array.from(new Set(activities.map(a => a.establishment).filter((e): e is string => Boolean(e))));
  return uniqueEstablishments.sort();
};

// Експортуємо дані в Markdown
export const exportToMarkdown = async (): Promise<string> => {
  const activities = await getActivities();
  
  if (activities.length === 0) {
    return '# Відстеження переміщень\n\nНемає переміщень.\n';
  }
  
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

  let markdown = '# Відстеження активності компанії\n\n';
  
  // Статистика в шапці
  markdown += '## Статистика\n\n';
  markdown += `**Переміщень:** ${totalActivities}\n\n`;
  markdown += `**🚗:** ${totalPeopleByCar}\n\n`;
  markdown += `**🐷:** ${totalPeopleByWalk}\n\n`;
  markdown += '**Напрямки:**\n';
  markdown += `- **+:** ${directionStats.plus}\n`;
  markdown += `- **-:** ${directionStats.minus}\n`;
  markdown += `- **=:** ${directionStats.equals}\n\n`;
  
  if (establishmentStatsArray.length > 0) {
    markdown += '**Заклади (🐷):**\n';
    establishmentStatsArray.forEach(({ establishment, events, people, directions }) => {
      markdown += `- **${establishment}:** подій: ${events}, людей: ${people}, напрямки: +${directions.plus} -${directions.minus} =${directions.equals}\n`;
    });
    markdown += '\n';
  }
  
  markdown += '---\n\n';
  
  // Таблиця активностей
  markdown += '## Таблиця переміщень\n\n';
  
  // Заголовок таблиці
  markdown += '| Час | Кількість | Тип | Статус | Напрямок | Заклад | Координати | Стрім | Відділ | Посилання | Коментар |\n';
  markdown += '|-----|-----------|-----|--------|----------|--------|------------|-------|--------|-----------|----------|\n';
  
  activities.forEach((activity) => {
    const time = `${activity.hour}:${activity.minute}`;
    const count = activity.participantsCount || '—';
    const transport = activity.transportType === 'walk' ? '🐷' : activity.transportType === 'car' ? '🚗' : '—';
    
    // Статус
    const statusParts: string[] = [];
    if (activity.greenCount) statusParts.push(`🟢${activity.greenCount}`);
    if (activity.yellowCount) statusParts.push(`🟡${activity.yellowCount}`);
    if (activity.redCount) statusParts.push(`🔴${activity.redCount}`);
    const status = statusParts.length > 0 ? statusParts.join(' ') : '—';
    
    const direction = activity.direction || '—';
    const establishment = activity.establishment || '—';
    const coordinates = activity.coordinates || '—';
    const mainPerson = activity.mainPerson;
    const department = activity.department || '—';
    const link = activity.link ? `[${activity.link.length > 30 ? activity.link.substring(0, 30) + '...' : activity.link}](${activity.link})` : '—';
    const comment = activity.comment || '—';
    
    markdown += `| ${time} | ${count} | ${transport} | ${status} | ${direction} | ${establishment} | ${coordinates} | ${mainPerson} | ${department} | ${link} | ${comment} |\n`;
    
    // Деталі активності
    if (activity.details && activity.details.length > 0) {
      markdown += '\n**Деталі:**\n\n';
      markdown += '| Час | Кількість | Координати | Стрім | Статус | Посилання | Коментар |\n';
      markdown += '|-----|-----------|------------|-------|--------|-----------|----------|\n';
      
      activity.details.forEach((detail) => {
        const detailTime = `${detail.hour}:${detail.minute}`;
        const detailCount = detail.participantsCount || '—';
        const detailCoordinates = detail.coordinates || '—';
        const detailMainPerson = detail.mainPerson;
        
        const detailStatusParts: string[] = [];
        if (detail.greenCount) detailStatusParts.push(`🟢${detail.greenCount}`);
        if (detail.yellowCount) detailStatusParts.push(`🟡${detail.yellowCount}`);
        if (detail.redCount) detailStatusParts.push(`🔴${detail.redCount}`);
        const detailStatus = detailStatusParts.length > 0 ? detailStatusParts.join(' ') : '—';
        
        const detailLink = detail.link ? `[${detail.link.length > 30 ? detail.link.substring(0, 30) + '...' : detail.link}](${detail.link})` : '—';
        const detailComment = detail.comment || '—';
        
        markdown += `| ${detailTime} | ${detailCount} | ${detailCoordinates} | ${detailMainPerson} | ${detailStatus} | ${detailLink} | ${detailComment} |\n`;
      });
      
      markdown += '\n';
    }
  });
  
  return markdown;
};

// Копіюємо дані в буфер обміну
export const copyMarkdownToClipboard = async (): Promise<void> => {
  const markdown = await exportToMarkdown();
  
  try {
    // Використовуємо сучасний Clipboard API
    await navigator.clipboard.writeText(markdown);
  } catch (error) {
    // Fallback для старих браузерів
    const textArea = document.createElement('textarea');
    textArea.value = markdown;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
    } catch (err) {
      textArea.remove();
      throw new Error('Не вдалося скопіювати в буфер обміну');
    }
  }
};

// Залишаємо стару функцію для сумісності (якщо десь використовується)
export const downloadMarkdown = async (): Promise<void> => {
  await copyMarkdownToClipboard();
};
