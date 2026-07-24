export interface Ticket {
  id: number
  roomNumber: string
  authorName: string
  description: string
  statusText: string
  createdAt: string
  assigneeId: number | null
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}