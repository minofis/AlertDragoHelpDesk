import { useEffect } from 'react'
import styles from './BaseModal.module.css'

interface BaseModalProps {
  children: React.ReactNode
  onClose: () => void
}

const BaseModal: React.FC<BaseModalProps> = ({ children, onClose }) => {
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
        {children}
      </div>
    </div>
  )
}

export default BaseModal
