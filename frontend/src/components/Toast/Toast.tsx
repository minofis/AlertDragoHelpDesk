import type { ToastState } from '../../hooks/useToast'
import styles from './Toast.module.css'

interface ToastProps {
  toast: ToastState | null
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (toast === null) return null

  return (
    <div
      className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError} ${toast.exiting ? styles.toastExit : ''} ${toast.onClick ? styles.toastClickable : ''}`}
      onClick={toast.onClick}
      role={toast.onClick ? 'button' : undefined}
      tabIndex={toast.onClick ? 0 : undefined}
    >
      {toast.message}
    </div>
  )
}

export default Toast
