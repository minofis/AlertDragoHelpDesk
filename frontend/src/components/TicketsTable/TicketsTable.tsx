import React, { useState, useEffect } from 'react'
import type { Ticket, PagedResponse } from '../../models/ticket'
import styles from './TicketsTable.module.css'

interface TicketsTableProps {
  refreshKey: number
  highlightedTicketId: number | null
  pageNumber: number
  totalPages: number
  onTotalPagesChange: (totalPages: number) => void
  onPrevPage: () => void
  onNextPage: () => void
}

const TicketsTable: React.FC<TicketsTableProps> = ({
  refreshKey,
  highlightedTicketId,
  pageNumber,
  totalPages,
  onTotalPagesChange,
  onPrevPage,
  onNextPage,
}) => {

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:5220/api/Tickets?pageNumber=${pageNumber}`)
        const data: PagedResponse<Ticket> = await response.json()
        setTickets(data.items)
        onTotalPagesChange(data.totalPages)
        console.log('Received tickets:', data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [refreshKey, pageNumber, onTotalPagesChange])

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScrollWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.headerCell} ${styles.colId}`}>ID</th>
              <th className={`${styles.headerCell} ${styles.colRoom}`}>Room number</th>
              <th className={`${styles.headerCell} ${styles.colAuthor}`}>Author</th>
              <th className={`${styles.headerCell} ${styles.colDescription}`}>Description</th>
              <th className={`${styles.headerCell} ${styles.colDate}`}>Date</th>
              <th className={`${styles.headerCell} ${styles.colStatus}`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && tickets.length === 0 ? (
              <tr>
                <td className={styles.emptyState} colSpan={6}>No tickets yet</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={String(ticket.id) === String(highlightedTicketId) ? styles.highlightedRow : undefined}
                >
                  <td className={`${styles.cell} ${styles.colId}`}>{ticket.id}</td>
                  <td className={`${styles.cell} ${styles.colRoom}`}>{ticket.roomNumber}</td>
                  <td className={`${styles.cell} ${styles.colAuthor}`}>{ticket.authorName}</td>
                  <td className={`${styles.cell} ${styles.colDescription}`}>{ticket.description}</td>
                  <td className={`${styles.cell} ${styles.colDate}`}>{ticket.createdAt}</td>
                  <td className={`${styles.cell} ${styles.colStatus}`}>{ticket.statusText}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          disabled={pageNumber === 1}
          onClick={onPrevPage}
        >
          &lt; Prev
        </button>
        <span className={styles.paginationInfo}>
          Page {pageNumber} of {totalPages}
        </span>
        <button
          className={styles.paginationButton}
          disabled={pageNumber === totalPages}
          onClick={onNextPage}
        >
          Next &gt;
        </button>
      </div>
    </div>
  )
}
export default TicketsTable
