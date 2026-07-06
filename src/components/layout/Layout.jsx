import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import SecondarySidebar from './SecondarySidebar'
import TopBar from './TopBar'
import TitleBar from './TitleBar'

export default function Layout() {
  return (
    <div className="flex flex-col h-full w-full bg-[#0d0d10] overflow-hidden">
      {/* Frameless window title bar (only visible in Electron) */}
      <TitleBar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Primary Sidebar — icon-only */}
        <Sidebar />

        {/* Secondary Sidebar — module menu */}
        <SecondarySidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-[#0d0d10] p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
