import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { Ticket } from '../../models/ticket'
import type { OutletContextType } from '../Layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { getAllTickets, getMyTickets } from '../../api/client'
import StatusBadge from '../StatusBadge/StatusBadge'
import { formatShortName } from '../../utils/nameFormatters'
import styles from './TicketsTable.module.css'

const TicketsTable: React.FC = () => {
  const {
    refreshKey,
    highlightedTicketId,
    pageNumber,
    totalPages,
    onTotalPagesChange,
    onPrevPage,
    onNextPage,
    onRowClick,
    onTicketsLoaded,
    onCreateClick,
  } = useOutletContext<OutletContextType>()

  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    let cancelled = false

    const fetchTickets = async () => {
      try {
        const data = isAdmin
          ? await getAllTickets(pageNumber)
          : await getMyTickets(pageNumber)
        if (cancelled) return
        setTickets(data.items)
        onTotalPagesChange(data.totalPages)
        onTicketsLoaded(data.items)
        if (!initialLoadDone.current) {
          initialLoadDone.current = true
          setIsLoading(false)
        }
      } catch (error) {
        if (cancelled) return
        console.error('Error fetching tickets:', error)
        if (!initialLoadDone.current) {
          initialLoadDone.current = true
          setIsLoading(false)
        }
      }
    }

    fetchTickets()

    return () => {
      cancelled = true
    }
  }, [refreshKey, pageNumber, isAdmin])

  const tableBody = (() => {
    if (isLoading) {
      return null
    }
    if (tickets.length === 0) {
      return (
        <tr>
          <td className={styles.emptyState} colSpan={6}>Ще немає жодної заявки</td>
        </tr>
      )
    }
    return tickets.map((ticket) => (
      <tr
        key={ticket.id}
        className={String(ticket.id) === String(highlightedTicketId) ? styles.highlightedRow : undefined}
        onClick={() => onRowClick?.(ticket)}
      >
        <td className={`${styles.cell} ${styles.colId}`}>{ticket.id}</td>
        <td className={`${styles.cell} ${styles.colRoom}`}>{ticket.roomNumber}</td>
        <td className={`${styles.cell} ${styles.colAuthor}`}>{formatShortName(ticket.authorName)}</td>
        <td className={`${styles.cell} ${styles.colDescription}`}>{ticket.description}</td>
        <td className={`${styles.cell} ${styles.colDate}`}>{ticket.createdAt}</td>
        <td className={`${styles.cell} ${styles.colStatus}`}><StatusBadge status={ticket.statusText} /></td>
      </tr>
    ))
  })()

  return (
    <>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{isAdmin ? 'Усі заявки' : 'Мої заявки'}</h2>
        {!isAdmin && (
          <button className={styles.createButton} onClick={onCreateClick} type="button">
            Подати заявку
          </button>
        )}
      </div>
      <div className={styles.wrapper}>
        <div className={styles.tableScrollWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={`${styles.headerCell} ${styles.colId}`}>№</th>
              <th className={`${styles.headerCell} ${styles.colRoom}`}>Аудиторія</th>
              <th className={`${styles.headerCell} ${styles.colAuthor}`}>Заявник</th>
              <th className={`${styles.headerCell} ${styles.colDescription}`}>Опис проблеми</th>
              <th className={`${styles.headerCell} ${styles.colDate}`}>Дата</th>
              <th className={`${styles.headerCell} ${styles.colStatus}`}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.emptyState} colSpan={6}>Loading...</td>
              </tr>
            ) : (
              tableBody
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
          &lt; Попередня
        </button>
        <span className={styles.paginationInfo}>
          Сторінка {pageNumber} з {totalPages}
        </span>
        <button
          className={styles.paginationButton}
          disabled={pageNumber === totalPages}
          onClick={onNextPage}
        >
          Наступна &gt;
        </button>
        </div>
      </div>
    </>
  )
}
export default TicketsTable
