interface Ticket {
  id: number
  roomNumber: string
  authorName: string
  description: string
  statusText: string
  createdAt: string
  assigneeId: number | null
}