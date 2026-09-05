import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import NavigationProgressBar from './components/NavigationProgressBar'
import MaintenanceGuard from './components/MaintenanceGuard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationProgressBar />
        <MaintenanceGuard />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App
