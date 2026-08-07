import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationResponseDto } from '../../models/notification';
import { getNotifications, markNotificationAsRead, clearReadNotifications } from '../../api/client';
import BaseModal from '../BaseModal/BaseModal';
import styles from './NotificationModal.module.css';

const NOTIFICATION_PAGE_SIZE = 20;

interface NotificationModalProps {
  onClose: () => void;
  onCountChange: () => void;
  pollingSignal?: number;
  onTicketClick?: (ticketId: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose, onCountChange, pollingSignal, onTicketClick }) => {
  const [items, setItems] = useState<NotificationResponseDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const hasMoreRef = useRef(hasMore);
  const pageNumberRef = useRef(pageNumber);
  const filterRef = useRef(filter);

  isLoadingRef.current = isLoading;
  isLoadingMoreRef.current = isLoadingMore;
  hasMoreRef.current = hasMore;
  pageNumberRef.current = pageNumber;
  filterRef.current = filter;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPage = useCallback(async (unreadOnly: boolean, page: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await getNotifications(page, NOTIFICATION_PAGE_SIZE, unreadOnly);
      if (append) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setHasMore(page < data.totalPages);
      setPageNumber(page);
    } catch {
      console.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setItems([]);
    setPageNumber(1);
    setHasMore(true);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
    fetchPage(filter === 'unread', 1, false);
  }, [filter, fetchPage]);

  useEffect(() => {
    if (pollingSignal === undefined || pollingSignal <= 0) return;
    setItems([]);
    setPageNumber(1);
    setHasMore(true);
    fetchPage(filterRef.current === 'unread', 1, false);
  }, [pollingSignal, fetchPage]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      const nextPage = pageNumberRef.current + 1;
      fetchPage(filterRef.current === 'unread', nextPage, true);
    }
  }, [fetchPage]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      onCountChange();
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMenuOpen(false);
    const unreadItems = items.filter((n) => !n.isRead);
    for (const n of unreadItems) {
      try {
        await markNotificationAsRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      } catch {
        console.error(`Failed to mark notification ${n.id} as read`);
      }
    }
    onCountChange();
  };

  const handleClearRead = async () => {
    setIsMenuOpen(false);
    if (!window.confirm('Ви впевнені, що хочете видалити всі прочитані сповіщення?')) return;
    try {
      await clearReadNotifications();
      setItems([]);
      setPageNumber(1);
      setHasMore(true);
      fetchPage(filter === 'unread', 1, false);
      onCountChange();
    } catch {
      console.error('Failed to clear read notifications');
    }
  };

  const unreadCount = items.filter((n) => !n.isRead).length;
  const showLoadingSpinner = isLoading && !isLoadingMore;

  return (
    <BaseModal onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Сповiщення</h2>
        </div>

        <div className={styles.controlsRow}>
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
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              className={styles.menuTrigger}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              type="button"
              title="Дії"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="3" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13" cy="8" r="1.5" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                {unreadCount > 0 && (
                  <button
                    className={styles.dropdownItem}
                    onClick={handleMarkAllAsRead}
                    type="button"
                  >
                    Прочитати всi
                  </button>
                )}
                <button
                  className={styles.dropdownItem}
                  onClick={handleClearRead}
                  type="button"
                >
                  Очистити прочитані
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.list} ref={listRef} onScroll={handleScroll}>
          {showLoadingSpinner && (
            <div className={styles.empty}>Завантаження...</div>
          )}
          {!isLoading && items.length === 0 && (
            <div className={styles.empty}>Немає сповiщень</div>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''} ${n.relatedTicketId != null ? styles.itemClickable : ''}`}
              onClick={async () => {
                if (n.relatedTicketId != null && onTicketClick) {
                  if (!n.isRead) {
                    try {
                      await markNotificationAsRead(n.id);
                    } catch {}
                    setItems((prev) =>
                      prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
                    );
                  }
                  onTicketClick(n.relatedTicketId);
                  onClose();
                  onCountChange();
                }
              }}
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
          {isLoadingMore && (
            <div className={styles.empty}>Завантаження...</div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default NotificationModal;
