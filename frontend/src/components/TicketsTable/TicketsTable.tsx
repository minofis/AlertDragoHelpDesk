import React, { useState, useEffect } from 'react'
import styles from './TicketsTable.module.css'

const TicketsTable: React.FC = () => {

  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:5220/api/Tickets')
        const data: Ticket[] = await response.json()
        setTickets(data)
        console.log('Received tickets:', data)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      }
    }

    fetchTickets()
  }, [])

  return (
<table className={styles.table}>
  <thead>
    <tr>
      <th className={styles.headerCell}>ID</th>
      <th className={styles.headerCell}>Room number</th>
      <th className={styles.headerCell}>Author</th>
      <th className={styles.headerCell}>Description</th>
      <th className={styles.headerCell}>Date</th>
      <th className={styles.headerCell}>Status</th>
    </tr>
  </thead>
  <tbody>
    {tickets.map((ticket) => (
      <tr key={ticket.id}>
        <td className={styles.cell}>{ticket.id}</td>
        <td className={styles.cell}>{ticket.roomNumber}</td>
        <td className={styles.cell}>{ticket.authorName}</td>
        <td className={styles.cell}>{ticket.description}</td>
        <td className={styles.cell}>{ticket.createdAt}</td>
        <td className={styles.cell}>{ticket.statusText}</td>
      </tr>
    ))}
  </tbody>
</table>
  )
}
  export default TicketsTable