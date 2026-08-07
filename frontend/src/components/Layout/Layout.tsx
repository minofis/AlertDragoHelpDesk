import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import type { Ticket } from '../../models/ticket'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useSmartPolling } from '../../hooks/useSmartPolling'
import { getUnreadNotificationCount, getNotifications, markNotificationAsRead } from '../../api/client'
import type { NotificationResponseDto } from '../../models/notification'
import Header from '../Header/Header'
import BaseModal from '../BaseModal/BaseModal'
import CreateTicketForm from '../CreateTicketForm/CreateTicketForm'
import TicketDetailsModal from '../TicketDetailsModal/TicketDetailsModal'
import NotificationModal from '../NotificationModal/NotificationModal'
import Toast from '../Toast/Toast'
import styles from './Layout.module.css'

export interface OutletContextType {
  refreshKey: number
  highlightedTicketId: number | null
  pageNumber: number
  totalPages: number
  onTotalPagesChange: (totalPages: number) => void
  onPrevPage: () => void
  onNextPage: () => void
  onRowClick: (ticket: Ticket) => void
  onTicketsLoaded: (tickets: Ticket[]) => void
  onCreateClick: () => void
}

function Layout() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [highlightedTicketId, setHighlightedTicketId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pollingSignal, setPollingSignal] = useState(0)
  const prevUnreadCountRef = useRef(0)
  const seenNotificationIds = useRef<Set<string>>(new Set())
  const initialPollDoneRef = useRef(false)
  const { toast, showToast } = useToast()
  const { user } = useAuth()

  useSmartPolling(() => setRefreshKey((prev) => prev + 1), 60000)

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotificationCount()
      if (data.count > prevUnreadCountRef.current) {
        setPollingSignal((prev) => prev + 1)

        const unreadPage = await getNotifications(1, 20, true)

        if (!initialPollDoneRef.current) {
          unreadPage.items.forEach((n: NotificationResponseDto) => seenNotificationIds.current.add(n.id))
          initialPollDoneRef.current = true
        } else {
          const newNotifications = unreadPage.items.filter(
            (n: NotificationResponseDto) => !seenNotificationIds.current.has(n.id)
          )

          if (newNotifications.length > 0) {
            newNotifications.forEach((n: NotificationResponseDto) => seenNotificationIds.current.add(n.id))

            new Audio('/notify.mp3').play().catch((e: unknown) => console.warn('Audio blocked', e))

            if (newNotifications.length === 1) {
              const n = newNotifications[0]
              if (n.relatedTicketId !== null) {
                showToast(n.message, 'success', async () => {
                  try {
                    await markNotificationAsRead(n.id)
                    const { count } = await getUnreadNotificationCount()
                    prevUnreadCountRef.current = count
                    setUnreadCount(count)
                  } catch {
                    /* silently ignore */
                  }
                  setSelectedTicketId(n.relatedTicketId!)
                })
              } else {
                showToast(n.message, 'success')
              }
            } else {
              showToast(`У вас ${newNotifications.length} нових сповіщень`, 'success')
            }
          }
        }
      } else if (!initialPollDoneRef.current) {
        initialPollDoneRef.current = true
      }
      prevUnreadCountRef.current = data.count
      setUnreadCount(data.count)
    } catch {
      /* silently ignore */
    }
  }

  useSmartPolling(() => {
    if (!user) return
    fetchUnreadCount()
  }, 60000)

  useEffect(() => {
    if (highlightedTicketId === null) return

    const timer = setTimeout(() => {
      setHighlightedTicketId(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [highlightedTicketId])

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, totalPages))
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const outletContext: OutletContextType = {
    refreshKey,
    highlightedTicketId,
    pageNumber,
    totalPages,
    onTotalPagesChange: setTotalPages,
    onPrevPage: handlePrevPage,
    onNextPage: handleNextPage,
    onRowClick: (ticket: Ticket) => setSelectedTicketId(ticket.id),
    onTicketsLoaded: () => {},
    onCreateClick: handleCreateClick,
  }

  return (
    <div className={styles.layout}>
      <Header
        unreadCount={unreadCount}
        onNotificationsClick={() => setIsNotificationsModalOpen(true)}
      />
      <div className={styles.outlet}>
        <Outlet context={outletContext} />
      </div>
      {isCreateModalOpen && (
        <BaseModal onClose={() => setIsCreateModalOpen(false)}>
          <CreateTicketForm
            onSuccess={(ticketId) => {
              setPageNumber(1)
              setRefreshKey((key) => key + 1)
              setHighlightedTicketId(ticketId)
              setIsCreateModalOpen(false)
              showToast('Заявку успішно створено!', 'success')
            }}
            onError={() => {
              showToast('Не вдалося створити заявку. Спробуйте ще раз.', 'error')
            }}
          />
        </BaseModal>
      )}
      {selectedTicketId !== null && (
        <TicketDetailsModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          showToast={showToast}
          onRefreshNeeded={() => setRefreshKey((key) => key + 1)}
        />
      )}
      {isNotificationsModalOpen && (
        <NotificationModal
          onClose={() => {
            setIsNotificationsModalOpen(false)
            fetchUnreadCount()
          }}
          onCountChange={fetchUnreadCount}
          pollingSignal={pollingSignal}
          onTicketClick={(ticketId: number) => {
            setIsNotificationsModalOpen(false)
            setSelectedTicketId(ticketId)
          }}
        />
      )}
      <Toast toast={toast} />
    </div>
  )
}

export default Layout
