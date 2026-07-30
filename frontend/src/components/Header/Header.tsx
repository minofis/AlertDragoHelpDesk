import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css'

interface HeaderProps {
  onCreateClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ADHD</h1>
      <div className={styles.headerRight}>
        <button className={styles.createButton} onClick={onCreateClick} type="button">
          Create Ticket
        </button>
        <span className={styles.userInfo}>
          {user?.name ?? user?.email}
        </span>
        <button className={styles.logoutButton} onClick={logout} type="button">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
