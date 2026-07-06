import { HashRouter } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </HashRouter>
  )
}
