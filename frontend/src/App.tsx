import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import TicketsTable from './components/TicketsTable/TicketsTable'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TicketsTable />} />
          <Route path="admin" element={<TicketsTable isAdminView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
