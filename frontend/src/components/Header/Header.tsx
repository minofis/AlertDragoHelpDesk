import UserMenu from '../UserMenu/UserMenu';
import styles from './Header.module.css';

interface HeaderProps {
  onCreateClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ADHD</h1>
      <div className={styles.headerRight}>
        <button className={styles.createButton} onClick={onCreateClick} type="button">
          Подати заявку
        </button>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
