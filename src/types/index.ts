export interface Activity {
  id: number;
  hour: string;
  minute: string;
  participantsCount?: number | null;
  transportType?: 'walk' | 'car' | null;
  coordinates?: string | null;
  mainPerson: string;
  establishment?: string | null;
  department?: 'літуни' | 'тіхоні' | null;
  link?: string | null;
  comment?: string | null;
}

export interface CreateActivityDto {
  hour: string;
  minute: string;
  participantsCount?: number | null;
  transportType?: 'walk' | 'car' | null;
  coordinates?: string | null;
  mainPerson: string;
  establishment?: string | null;
  department?: 'літуни' | 'тіхоні' | null;
  link?: string | null;
  comment?: string | null;
}

export interface FormData {
  time: string;
  participantsCount: string;
  transportType: string;
  coordinates: string;
  mainPerson: string;
  establishment: string;
  department: string;
  link: string;
  comment: string;
}

