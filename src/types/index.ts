export interface DetailItem {
  id: number;
  hour: string;
  minute: string;
  participantsCount?: number | null;
  coordinates?: string | null;
  mainPerson: string;
  link?: string | null;
  comment?: string | null;
  greenCount?: number | null;
  yellowCount?: number | null;
  redCount?: number | null;
}

export interface Activity {
  id: number;
  hour: string;
  minute: string;
  participantsCount?: number | null;
  transportType?: 'walk' | 'car' | null;
  greenCount?: number | null;
  yellowCount?: number | null;
  redCount?: number | null;
  direction?: '+' | '-' | '=' | null;
  coordinates?: string | null;
  mainPerson: string;
  establishment?: string | null;
  department?: 'літуни' | 'тіхоні' | null;
  link?: string | null;
  comment?: string | null;
  details?: DetailItem[];
}

export interface CreateActivityDto {
  hour: string;
  minute: string;
  participantsCount?: number | null;
  transportType?: 'walk' | 'car' | null;
  greenCount?: number | null;
  yellowCount?: number | null;
  redCount?: number | null;
  direction?: '+' | '-' | '=' | null;
  coordinates?: string | null;
  mainPerson: string;
  establishment?: string | null;
  department?: 'літуни' | 'тіхоні' | null;
  link?: string | null;
  comment?: string | null;
}

export interface CreateDetailDto {
  hour: string;
  minute: string;
  participantsCount?: number | null;
  coordinates?: string | null;
  mainPerson: string;
  link?: string | null;
  comment?: string | null;
  greenCount?: number | null;
  yellowCount?: number | null;
  redCount?: number | null;
}

export interface FormData {
  time: string;
  participantsCount: string;
  transportType: string;
  greenCount: string;
  yellowCount: string;
  redCount: string;
  direction: string;
  coordinates: string;
  mainPerson: string;
  establishment: string;
  department: string;
  link: string;
  comment: string;
}

