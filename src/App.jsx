import { HashRouter } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { UbicacionProvider } from './contexts/UbicacionContext'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <HashRouter>
      <UbicacionProvider>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </UbicacionProvider>
    </HashRouter>
  )
}
