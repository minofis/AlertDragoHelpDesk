import type { Ticket } from '../../models/ticket'
import BaseModal from '../BaseModal/BaseModal'
import styles from './TicketDetailsModal.module.css'

interface TicketDetailsModalProps {
  ticket: Ticket
  onClose: () => void
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose }) => {
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
    </BaseModal>
  )
}

export default TicketDetailsModal
