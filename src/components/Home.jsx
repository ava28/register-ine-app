import React from 'react'
import Navbar from './Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="pt-20 px-4">
        <h1 className="text-2xl font-bold">Bienvenido a la página principal</h1>
        <p className="mt-2 text-gray-600">Aquí puedes explorar tu aplicación.</p>
      </div>
    </>
  )
}
