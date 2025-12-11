import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { getUniqueMainPersons } from '../services/activityService';
import './NameAutocomplete.css';

interface NameAutocompleteProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function NameAutocomplete({ value, onChange, placeholder, required }: NameAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allNames, setAllNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value || '');
  const [loading, setLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Функція для завантаження унікальних імен з бази даних
  const loadNames = async (): Promise<void> => {
    try {
      setLoading(true);
      const names = await getUniqueMainPersons();
      setAllNames(names);
    } catch (error) {
      console.error('Помилка завантаження імен:', error);
      setAllNames([]);
    } finally {
      setLoading(false);
    }
  };

  // Завантажуємо унікальні імена з бази даних при монтуванні компонента
  useEffect(() => {
    loadNames();
  }, []);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterNames = (query: string): string[] => {
    if (!query || query.trim() === '') return allNames;
    
    const lowerQuery = query.toLowerCase();
    return allNames.filter(name => 
      name.toLowerCase().includes(lowerQuery)
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange({ target: { name: 'mainPerson', value: newValue } } as ChangeEvent<HTMLInputElement>);

    if (newValue.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      const filtered = filterNames(newValue);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleSelectSuggestion = (suggestion: string): void => {
    setInputValue(suggestion);
    onChange({ target: { name: 'mainPerson', value: suggestion } } as ChangeEvent<HTMLInputElement>);
    setShowSuggestions(false);
  };

  const handleBlur = (): void => {
    // Затримка, щоб дати час на клік по пропозиції
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        name="mainPerson"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={async () => {
          // Оновлюємо список імен при фокусі, щоб завжди мати актуальні дані
          const names = await getUniqueMainPersons();
          setAllNames(names);
          if (inputValue.trim() !== '') {
            const lowerQuery = inputValue.toLowerCase();
            const filtered = names.filter(name => 
              name.toLowerCase().includes(lowerQuery)
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          } else {
            setSuggestions(names);
            setShowSuggestions(names.length > 0);
          }
        }}
        onBlur={handleBlur}
        placeholder={placeholder || 'Введіть ім\'я'}
        className="form-input autocomplete-input"
        required={required}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="autocomplete-suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NameAutocomplete;

