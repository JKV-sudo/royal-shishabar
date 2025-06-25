export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  imageUrl?: string;
  price?: number;
  capacity?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attendees?: string[];
  category?: string;
  tags?: string[];
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  price?: number;
  capacity?: number;
  category?: string;
  tags?: string[];
}

export interface EventFilters {
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isActive?: boolean;
  search?: string;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
} 