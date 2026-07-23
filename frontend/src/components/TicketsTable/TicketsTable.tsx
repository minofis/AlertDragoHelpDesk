import React, { useState, useEffect } from 'react'
import styles from './TicketsTable.module.css'

interface TicketsTableProps {
  refreshKey: number
}

const TicketsTable: React.FC<TicketsTableProps> = ({ refreshKey }) => {

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:5220/api/Tickets')
        const data: Ticket[] = await response.json()
        setTickets(data)
        console.log('Received tickets:', data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [refreshKey])

  return (
    <div className={styles.wrapper}>
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
              <tr key={ticket.id}>
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
  )
}
export default TicketsTable
