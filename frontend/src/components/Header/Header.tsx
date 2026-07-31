import { useAuth } from '../../context/AuthContext';
import UserMenu from '../UserMenu/UserMenu';
import styles from './Header.module.css';

interface HeaderProps {
  onCreateClick: () => void;
  showCreateButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCreateClick, showCreateButton = true }) => {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ADHD</h1>
      <div className={styles.headerRight}>
        {showCreateButton && (
          <button className={styles.createButton} onClick={onCreateClick} type="button">
            Create Ticket
          </button>
        )}
        {user && <UserMenu />}
      </div>
    </header>
  );
};

export default Header;
