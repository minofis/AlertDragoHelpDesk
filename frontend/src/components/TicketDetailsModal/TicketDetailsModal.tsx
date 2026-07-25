import { useEffect } from 'react'
import type { Ticket } from '../../models/ticket'
import styles from './TicketDetailsModal.module.css'

interface TicketDetailsModalProps {
  ticket: Ticket
  onClose: () => void
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} type="button">
          &times;
        </button>

        <h2 className={styles.title}>Ticket #{ticket.id}</h2>

        <div className={styles.content}>
          <div className={styles.field}>
            <span className={styles.label}>Room</span>
            <span className={styles.value}>{ticket.roomNumber}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Author</span>
            <span className={styles.value}>{ticket.authorName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Status</span>
            <span className={styles.value}>{ticket.statusText}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Date</span>
            <span className={styles.value}>{ticket.createdAt}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Assignee</span>
            <span className={styles.value}>
              {ticket.assigneeId !== null ? ticket.assigneeId : '-'}
            </span>
          </div>
          <div className={styles.descriptionSection}>
            <span className={styles.label}>Description</span>
            <p className={styles.descriptionText}>{ticket.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailsModal
