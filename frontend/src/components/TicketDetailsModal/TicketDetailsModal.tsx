import { useState, useEffect } from 'react'
import type { Ticket } from '../../models/ticket'
import { useAuth } from '../../context/AuthContext'
import { updateTicketStatus, getTicketById } from '../../api/client'
import BaseModal from '../BaseModal/BaseModal'
import StatusBadge from '../StatusBadge/StatusBadge'
import { reorderFullName } from '../../utils/nameFormatters'
import styles from './TicketDetailsModal.module.css'

interface TicketDetailsModalProps {
  ticketId: number
  onClose: () => void
  showToast: (message: string, type: 'success' | 'error') => void
  onRefreshNeeded: () => void
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticketId,
  onClose,
  showToast,
  onRefreshNeeded,
}) => {
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getTicketById(ticketId)
      .then((data) => {
        if (!cancelled) {
          setTicket(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Не вдалося завантажити заявку.')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [ticketId])

  const isUserAdmin = user?.role === 'Admin'

  const handleStatusUpdate = async (newStatus: number) => {
    if (!ticket) return
    setIsSubmitting(true)
    try {
      await updateTicketStatus(ticket.id, newStatus, 'System Admin')
      showToast('Статус заявки успішно оновлено!', 'success')
      onRefreshNeeded()
      onClose()
    } catch {
      showToast('Не вдалося оновити статус заявки. Спробуйте ще раз.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <BaseModal onClose={onClose}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Заявка #{ticketId}</h2>
        </div>
        <div className={styles.content}>
          <p>Завантаження...</p>
        </div>
      </BaseModal>
    )
  }

  if (error || !ticket) {
    return (
      <BaseModal onClose={onClose}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Заявка #{ticketId}</h2>
        </div>
        <div className={styles.content}>
          <p>{error ?? 'Заявку не знайдено.'}</p>
        </div>
      </BaseModal>
    )
  }

  const isNew = ticket.statusText === 'Нова'
  const isInProgress = ticket.statusText === 'В роботі'
  const isCompleted = ticket.statusText === 'Виконано'
  const isRejected = ticket.statusText === 'Відхилено'

  const showInProgressBtn = isUserAdmin && isNew
  const showResolveBtn = isUserAdmin && isInProgress
  const showRejectBtn = isUserAdmin && (isNew || isInProgress)

  return (
    <BaseModal onClose={onClose}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Заявка #{ticket.id}</h2>
        <StatusBadge status={ticket.statusText} />
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <span className={styles.label}>АУДИТОРІЯ</span>
          <span className={styles.value}>{ticket.roomNumber}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>ЗАЯВНИК</span>
          <span className={styles.value}>{reorderFullName(ticket.authorName)}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>ДАТА</span>
          <span className={styles.value}>{ticket.createdAt}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>ВИКОНАВЕЦЬ</span>
          <span className={styles.value}>
            {ticket.assigneeId !== null ? ticket.assigneeId : '-'}
          </span>
        </div>
        <div className={styles.descriptionSection}>
          <span className={styles.label}>ОПИС ПРОБЛЕМИ</span>
          <p className={styles.descriptionText}>{ticket.description}</p>
        </div>
      </div>

      {isUserAdmin && (showInProgressBtn || showResolveBtn || showRejectBtn) && (
        <div className={styles.actions}>
          {showInProgressBtn && (
            <button
              className={`${styles.actionButton} ${styles.inProgressButton}`}
              disabled={isSubmitting}
              onClick={() => handleStatusUpdate(1)}
              type="button"
            >
              Взяти в роботу
            </button>
          )}
          {showResolveBtn && (
            <button
              className={`${styles.actionButton} ${styles.resolveButton}`}
              disabled={isSubmitting}
              onClick={() => handleStatusUpdate(2)}
              type="button"
            >
              Виконати
            </button>
          )}
          {showRejectBtn && (
            <button
              className={`${styles.actionButton} ${styles.rejectButton}`}
              disabled={isSubmitting}
              onClick={() => handleStatusUpdate(3)}
              type="button"
            >
              Відхилити
            </button>
          )}
        </div>
      )}
      {isUserAdmin && isCompleted && (
        <div className={styles.actions}>
          <div className={`${styles.statusBanner} ${styles.resolvedBanner}`}>Заявка виконана</div>
        </div>
      )}
      {isUserAdmin && isRejected && (
        <div className={styles.actions}>
          <div className={`${styles.statusBanner} ${styles.rejectedBanner}`}>Заявка відхилена</div>
        </div>
      )}
    </BaseModal>
  )
}

export default TicketDetailsModal
