import { useState, useEffect } from 'react'
import type { Ticket } from './models/ticket'
import CreateTicketForm from './components/CreateTicketForm/CreateTicketForm'
import TicketsTable from './components/TicketsTable/TicketsTable'
import TicketDetailsModal from './components/TicketDetailsModal/TicketDetailsModal'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [highlightedTicketId, setHighlightedTicketId] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

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
      <CreateTicketForm
        onSuccess={(ticketId) => {
          setPageNumber(1)
          setRefreshKey((key) => key + 1)
          setHighlightedTicketId(ticketId)
        }}
      />
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
      {selectedTicket !== null && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}

export default App