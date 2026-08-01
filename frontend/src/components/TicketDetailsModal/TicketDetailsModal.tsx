import { useState } from 'react'
import type { Ticket } from '../../models/ticket'
import { useAuth } from '../../context/AuthContext'
import BaseModal from '../BaseModal/BaseModal'
import styles from './TicketDetailsModal.module.css'

interface TicketDetailsModalProps {
  ticket: Ticket
  onClose: () => void
  showToast: (message: string, type: 'success' | 'error') => void
  onRefreshNeeded: () => void
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  onClose,
  showToast,
  onRefreshNeeded,
}) => {
  const { user, token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isUserAdmin = user?.role === 'Admin'

  const handleStatusUpdate = async (newStatus: number) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `http://localhost:5220/api/Tickets/${ticket.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            assigneeId: 'System Admin',
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      showToast('Ticket status updated successfully!', 'success')
      onRefreshNeeded()
      onClose()
    } catch {
      showToast('Failed to update ticket status. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isNew = ticket.statusText === 'Нова'
  const isInProgress = ticket.statusText === 'В роботі'

  const showInProgressBtn = isUserAdmin && isNew
  const showResolveBtn = isUserAdmin && isInProgress
  const showRejectBtn = isUserAdmin && (isNew || isInProgress)

  return (
    <BaseModal onClose={onClose}>
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

      {(showInProgressBtn || showResolveBtn || showRejectBtn) && (
        <div className={styles.actions}>
          {showInProgressBtn && (
            <button
              className={`${styles.actionButton} ${styles.inProgressButton}`}
              disabled={isSubmitting}
              onClick={() => handleStatusUpdate(1)}
              type="button"
            >
              Take in Progress
            </button>
          )}
          {showResolveBtn && (
            <button
              className={`${styles.actionButton} ${styles.resolveButton}`}
              disabled={isSubmitting}
              onClick={() => handleStatusUpdate(2)}
              type="button"
            >
              Resolve
            </button>
          )}
          {showRejectBtn && (
            <button
              className={`${styles.actionButton} ${styles.rejectButton}`}
              disabled={isSubmitting}
              onClick={() => handleStatusUpdate(3)}
              type="button"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </BaseModal>
  )
}

export default TicketDetailsModal
