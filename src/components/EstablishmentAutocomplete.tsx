import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { getUniqueEstablishments } from '../services/activityService';
import './NameAutocomplete.css';

interface EstablishmentAutocompleteProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function EstablishmentAutocomplete({ value, onChange, placeholder, required }: EstablishmentAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Функція для завантаження унікальних закладів з бази даних
  const loadEstablishments = async (): Promise<void> => {
    try {
      const establishments = await getUniqueEstablishments();
      setAllEstablishments(establishments);
    } catch (error) {
      console.error('Помилка завантаження закладів:', error);
      setAllEstablishments([]);
    }
  };

  // Завантажуємо унікальні заклади з бази даних при монтуванні компонента
  useEffect(() => {
    loadEstablishments();
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

  const filterEstablishments = (query: string): string[] => {
    if (!query || query.trim() === '') return allEstablishments;
    
    const lowerQuery = query.toLowerCase();
    return allEstablishments.filter(establishment => 
      establishment.toLowerCase().includes(lowerQuery)
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange({ target: { name: 'establishment', value: newValue } } as ChangeEvent<HTMLInputElement>);

    if (newValue.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      const filtered = filterEstablishments(newValue);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleSelectSuggestion = (suggestion: string): void => {
    setInputValue(suggestion);
    onChange({ target: { name: 'establishment', value: suggestion } } as ChangeEvent<HTMLInputElement>);
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
        name="establishment"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={async () => {
          // Оновлюємо список закладів при фокусі, щоб завжди мати актуальні дані
          const establishments = await getUniqueEstablishments();
          setAllEstablishments(establishments);
          if (inputValue.trim() !== '') {
            const lowerQuery = inputValue.toLowerCase();
            const filtered = establishments.filter(establishment => 
              establishment.toLowerCase().includes(lowerQuery)
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          } else {
            setSuggestions(establishments);
            setShowSuggestions(establishments.length > 0);
          }
        }}
        onBlur={handleBlur}
        placeholder={placeholder || 'Введіть заклад'}
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

export default EstablishmentAutocomplete;

