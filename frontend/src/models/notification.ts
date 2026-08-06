export interface NotificationResponseDto {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type { PagedResponse } from './common';
