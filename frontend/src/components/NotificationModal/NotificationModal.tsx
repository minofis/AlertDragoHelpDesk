import { useState, useEffect, useCallback } from 'react';
import type { NotificationResponseDto } from '../../models/notification';
import { getNotifications, markNotificationAsRead } from '../../api/client';
import BaseModal from '../BaseModal/BaseModal';
import styles from './NotificationModal.module.css';

interface NotificationModalProps {
  onClose: () => void;
  onCountChange: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async (unreadOnly: boolean) => {
    try {
      const data = await getNotifications(unreadOnly);
      setNotifications(data);
    } catch {
      console.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications(filter === 'unread');
  }, [filter, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      onCountChange();
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    for (const n of unreadItems) {
      try {
        await markNotificationAsRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      } catch {
        console.error(`Failed to mark notification ${n.id} as read`);
      }
    }
    onCountChange();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <BaseModal onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Сповiщення</h2>
          {unreadCount > 0 && (
            <button
              className={styles.markAllButton}
              onClick={handleMarkAllAsRead}
              type="button"
            >
              Прочитати всi
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
            onClick={() => setFilter('all')}
            type="button"
          >
            Всi
          </button>
          <button
            className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`}
            onClick={() => setFilter('unread')}
            type="button"
          >
            Непрочитанi
          </button>
        </div>

        <div className={styles.list}>
          {isLoading && (
            <div className={styles.empty}>Завантаження...</div>
          )}
          {!isLoading && notifications.length === 0 && (
            <div className={styles.empty}>Немає сповiщень</div>
          )}
          {!isLoading &&
            notifications.map((n) => (
              <div
                key={n.id}
                className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
              >
                <div className={styles.itemContent}>
                  <p className={styles.message}>{n.message}</p>
                  <span className={styles.time}>{n.createdAt}</span>
                </div>
                {!n.isRead && (
                  <button
                    className={styles.readButton}
                    onClick={() => handleMarkAsRead(n.id)}
                    type="button"
                    title="Позначити як прочитане"
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </BaseModal>
  );
};

export default NotificationModal;
