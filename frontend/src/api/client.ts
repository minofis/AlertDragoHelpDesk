import type { NotificationResponseDto, PagedResponse } from '../models/notification';
import type { Ticket } from '../models/ticket';

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

export async function getTickets(pageNumber: number): Promise<PagedResponse<Ticket>> {
  return apiFetch<PagedResponse<Ticket>>(`/api/Tickets?pageNumber=${pageNumber}`);
}

export async function getTicketById(id: number): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${id}`);
}

export async function createTicket(ticketData: { roomNumber: string; description: string }): Promise<{ id: number }> {
  return apiFetch<{ id: number }>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
}

export async function updateTicketStatus(ticketId: number, status: number, assigneeId: string): Promise<void> {
  await apiFetch(`/api/Tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, assigneeId }),
  });
}
