import UserMenu from '../UserMenu/UserMenu';
import styles from './Header.module.css';

interface HeaderProps {
  onCreateClick: () => void;
  unreadCount: number;
  onNotificationsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateClick, unreadCount, onNotificationsClick }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ADHD</h1>
      <div className={styles.headerRight}>
        <button className={styles.notificationButton} onClick={onNotificationsClick} type="button" title="Сповiщення">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        <button className={styles.createButton} onClick={onCreateClick} type="button">
          Подати заявку
        </button>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
