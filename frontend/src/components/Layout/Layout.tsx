import { useState, useEffect, useMemo, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import type { Ticket } from '../../models/ticket'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useSmartPolling } from '../../hooks/useSmartPolling'
import { getUnreadNotificationCount } from '../../api/client'
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
}

function Layout() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [highlightedTicketId, setHighlightedTicketId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pollingSignal, setPollingSignal] = useState(0)
  const prevUnreadCountRef = useRef(0)
  const { toast, showToast } = useToast()
  const { user } = useAuth()

  useSmartPolling(() => setRefreshKey((prev) => prev + 1), 60000)

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotificationCount()
      if (data.count > prevUnreadCountRef.current) {
        setPollingSignal((prev) => prev + 1)
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

  const activeTicket = useMemo(
    () => (selectedTicketId !== null ? (tickets.find((t) => t.id === selectedTicketId) ?? null) : null),
    [selectedTicketId, tickets]
  )

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
    onTicketsLoaded: setTickets,
  }

  return (
    <div className={styles.layout}>
      <Header
        onCreateClick={handleCreateClick}
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
      {activeTicket !== null && (
        <TicketDetailsModal
          ticket={activeTicket}
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
        />
      )}
      <Toast toast={toast} />
    </div>
  )
}

export default Layout
