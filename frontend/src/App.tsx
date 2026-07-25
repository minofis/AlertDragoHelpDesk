import { useState, useEffect } from 'react'
import type { Ticket } from './models/ticket'
import { useToast } from './hooks/useToast'
import Header from './components/Header/Header'
import BaseModal from './components/BaseModal/BaseModal'
import CreateTicketForm from './components/CreateTicketForm/CreateTicketForm'
import TicketsTable from './components/TicketsTable/TicketsTable'
import TicketDetailsModal from './components/TicketDetailsModal/TicketDetailsModal'
import Toast from './components/Toast/Toast'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [highlightedTicketId, setHighlightedTicketId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast, showToast } = useToast()

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

  return (
    <div className="App">
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />
      <TicketsTable
        refreshKey={refreshKey}
        highlightedTicketId={highlightedTicketId}
        pageNumber={pageNumber}
        totalPages={totalPages}
        onTotalPagesChange={setTotalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onRowClick={setSelectedTicket}
      />
      {isCreateModalOpen && (
        <BaseModal onClose={() => setIsCreateModalOpen(false)}>
          <CreateTicketForm
            onSuccess={(ticketId) => {
              setPageNumber(1)
              setRefreshKey((key) => key + 1)
              setHighlightedTicketId(ticketId)
              setIsCreateModalOpen(false)
              showToast('Ticket successfully sent!', 'success')
            }}
            onError={() => {
              showToast('Failed to create ticket. Please try again.', 'error')
            }}
          />
        </BaseModal>
      )}
      {selectedTicket !== null && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
      <Toast toast={toast} />
    </div>
  )
}

export default App
