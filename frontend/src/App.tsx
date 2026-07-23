import { useState, useEffect } from 'react'
import CreateTicketForm from './components/CreateTicketForm/CreateTicketForm'
import TicketsTable from './components/TicketsTable/TicketsTable'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [highlightedTicketId, setHighlightedTicketId] = useState<number | null>(null)

  useEffect(() => {
    if (highlightedTicketId === null) return

    const timer = setTimeout(() => {
      setHighlightedTicketId(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [highlightedTicketId])

  return (
    <div className="App">
      <CreateTicketForm
        onSuccess={(ticketId) => {
          setRefreshKey((key) => key + 1)
          setHighlightedTicketId(ticketId)
        }}
      />
      <TicketsTable refreshKey={refreshKey} highlightedTicketId={highlightedTicketId} />
    </div>
  )
}

export default App