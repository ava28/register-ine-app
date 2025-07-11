// src/components/AfiliadosAdmin.jsx
import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { List, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from './Navbar'

export default function AfiliadosAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
        {/* Sidebar izquierda */}
        <aside
          className={`bg-gray-200 fixed top-16 left-0
            h-[calc(100vh-4rem)] flex flex-col
            transition-all duration-300 shadow-lg
            ${sidebarOpen ? 'w-64 p-4' : 'w-16 p-2 overflow-hidden'}
          `}
        >
          {/* Botón colapsar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="self-end mb-6 p-1 rounded-full hover:bg-gray-300 transition-colors text-gray-900"
            aria-label={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </button>

          {/* Menú */}
          <nav className="flex flex-col gap-2">
            <NavLink
              to="lista"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 transition-colors
                 hover:bg-gray-300
                 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-900'}`
              }
              title="Lista de Afiliados"
            >
              <List className="w-6 h-6" />
              {sidebarOpen && <span>Lista de Afiliados</span>}
            </NavLink>

            <NavLink
              to="recuento"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 transition-colors
                 hover:bg-gray-300
                 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-900'}`
              }
              title="Recuento de Afiliados"
            >
              <BarChart2 className="w-6 h-6" />
              {sidebarOpen && <span>Recuento de Afiliados</span>}
            </NavLink>
          </nav>
        </aside>

        {/* Main content derecha */}
        <main
          className={`flex-1 p-6 transition-margin duration-300
            ${sidebarOpen ? 'ml-64' : 'ml-16'}`}
          style={{ paddingTop: '1rem' }}
        >
          <Outlet />
        </main>
      </div>
    </>
  )
}
