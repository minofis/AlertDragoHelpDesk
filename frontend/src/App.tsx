import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import TicketsTable from './components/TicketsTable/TicketsTable'
import LoginPage from './components/LoginPage/LoginPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TicketsTable />} />
        <Route path="admin" element={<TicketsTable isAdminView />} />
      </Route>
    </Routes>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      {user === null ? <LoginPage /> : <AppRoutes />}
    </BrowserRouter>
  )
}

export default App
