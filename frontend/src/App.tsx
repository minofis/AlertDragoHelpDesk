import { useState } from 'react'
import CreateTicketForm from './components/CreateTicketForm/CreateTicketForm'
import TicketsTable from './components/TicketsTable/TicketsTable'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="App">
      <CreateTicketForm onSuccess={() => setRefreshKey((key) => key + 1)} />
      <TicketsTable refreshKey={refreshKey} />
    </div>
  )
}

export default App