import type { NotificationResponseDto, PagedResponse } from '../models/notification';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/api/notifications/unread-count');
}

export async function getNotifications(
  pageNumber: number,
  pageSize: number,
  unreadOnly: boolean
): Promise<PagedResponse<NotificationResponseDto>> {
  const params = new URLSearchParams();
  params.set('pageNumber', String(pageNumber));
  params.set('pageSize', String(pageSize));
  if (unreadOnly) {
    params.set('unreadOnly', 'true');
  }
  return apiFetch<PagedResponse<NotificationResponseDto>>(`/api/notifications?${params.toString()}`);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function clearReadNotifications(): Promise<void> {
  await apiFetch('/api/notifications', { method: 'DELETE' });
}
