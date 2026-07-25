import styles from './Header.module.css'

interface HeaderProps {
  onCreateClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ADHD</h1>
      <button className={styles.createButton} onClick={onCreateClick} type="button">
        Create Ticket
      </button>
    </header>
  )
}

export default Header
