export interface NotificationResponseDto {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  relatedTicketId: number | null;
  createdAt: string;
}

export type { PagedResponse } from './common';
