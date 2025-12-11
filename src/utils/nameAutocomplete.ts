const STORAGE_KEY = 'activity_main_persons';

export const saveName = (name: string): void => {
  if (!name || name.trim() === '') return;
  
  const names = getNames();
  const trimmedName = name.trim();
  
  // Додаємо ім'я, якщо його ще немає
  if (!names.includes(trimmedName)) {
    names.push(trimmedName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  }
};

export const getNames = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const filterNames = (query: string): string[] => {
  const names = getNames();
  if (!query || query.trim() === '') return names;
  
  const lowerQuery = query.toLowerCase();
  return names.filter(name => 
    name.toLowerCase().includes(lowerQuery)
  );
};

