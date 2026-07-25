import type { ToastState } from '../../hooks/useToast'
import styles from './Toast.module.css'

interface ToastProps {
  toast: ToastState | null
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (toast === null) return null

  return (
    <div
      className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError} ${toast.exiting ? styles.toastExit : ''}`}
    >
      {toast.message}
    </div>
  )
}

export default Toast
