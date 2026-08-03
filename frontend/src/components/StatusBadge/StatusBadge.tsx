import styles from './StatusBadge.module.css'

const statusMap: Record<string, string> = {
  'Нова': styles.new,
  'В роботі': styles.inProgress,
  'Виконано': styles.resolved,
  'Відхилено': styles.rejected,
}

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const modifier = statusMap[status] ?? styles.default

  return (
    <span className={`${styles.badge} ${modifier}`}>
      {status}
    </span>
  )
}

export default StatusBadge
