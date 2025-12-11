import { Activity, CreateActivityDto } from '../types';

const STORAGE_KEY = 'company_activities';

// Отримуємо всі активності з localStorage
export const getActivities = async (): Promise<Activity[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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
  
  let markdown = '# Відстеження активності компанії\n\n';
  markdown += `**Загальна кількість переміщень:** ${activities.length}\n\n`;
  markdown += '---\n\n';
  
  // Групуємо по датах (якщо буде додано поле дати в майбутньому)
  // Поки що просто виводимо всі активності
  
  activities.forEach((activity, index) => {
    markdown += `## Активність #${activity.id}\n\n`;
    markdown += `**Час:** ${activity.hour}:${activity.minute}\n\n`;
    
    if (activity.participantsCount) {
      markdown += `**Кількість:** ${activity.participantsCount}\n\n`;
    }
    
    if (activity.transportType) {
      const transportText = activity.transportType === 'walk' ? '🐷' : '🚗';
      markdown += `**Тип:** ${transportText}\n\n`;
    }
    
    if (activity.coordinates) {
      markdown += `**Координати:** ${activity.coordinates}\n\n`;
    }
    
    markdown += `**Стрім:** ${activity.mainPerson}\n\n`;
    
    if (activity.establishment) {
      markdown += `**Заклад:** ${activity.establishment}\n\n`;
    }
    
    if (activity.department) {
      markdown += `**Відділ:** ${activity.department}\n\n`;
    }
    
    if (activity.link) {
      markdown += `**Посилання:** [${activity.link}](${activity.link})\n\n`;
    }
    
    if (activity.comment) {
      markdown += `**Коментар:** ${activity.comment}\n\n`;
    }
    
    markdown += '---\n\n';
  });
  
  return markdown;
};

// Експортуємо дані в файл
export const downloadMarkdown = async (): Promise<void> => {
  const markdown = await exportToMarkdown();
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `company-activities-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
