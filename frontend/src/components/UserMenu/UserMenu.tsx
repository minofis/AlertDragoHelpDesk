import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './UserMenu.module.css';

function formatInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
  return initials + ' ' + parts[parts.length - 1];
}

function getAvatarLetter(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const displayName = user?.name || user?.email || 'User';
  const formattedName = formatInitials(displayName);
  const avatarLetter = getAvatarLetter(displayName);

  const toggle = () => setIsDropdownOpen(prev => !prev);

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <div
        className={styles.avatarWrapper}
        onClick={toggle}
        role="button"
        tabIndex={0}
        title={`Profile: ${formattedName}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className={styles.avatar}>
          {avatarLetter}
        </div>
        <svg
          className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {isDropdownOpen && (
        <div className={styles.dropdown}>
          <span className={styles.dropdownName}>{formattedName}</span>
          <span className={user?.role === 'Admin' ? styles.roleBadgeAdmin : styles.roleBadgeTeacher}>
            {user?.role === 'Admin' ? 'Admin' : 'Teacher'}
          </span>
          <div className={styles.dropdownDivider} />
          <button
            className={styles.dropdownLogout}
            onClick={() => { logout(); setIsDropdownOpen(false); }}
            type="button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
