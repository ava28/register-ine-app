import React, { useEffect, useState } from 'react'
import { ref, push, get } from 'firebase/database'
import { auth, database } from '../credenciales'
import { onAuthStateChanged } from 'firebase/auth'
import Swal from 'sweetalert2'
import Navbar from './Navbar'

export default function AfiliadosForm() {
    const [formData, setFormData] = useState({
        credencialId: '',
        nombre: '',
        telefono: '',
        sector: '',
    })

    const [userInfo, setUserInfo] = useState(null)
    const [ubicacion, setUbicacion] = useState(null)
    const [ubicacionCargada, setUbicacionCargada] = useState(false)

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const snapshot = await get(ref(database, 'usuarios/' + user.uid))
                const data = snapshot.val()
                if (data) {
                    setUserInfo({
                        uid: user.uid,
                        nombreCompleto: `${data.nombre} ${data.apellido}`,
                    })
                }
            }
        })

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
                    )
                    const data = await response.json()
                    const direccion = data.display_name || 'Ubicación no disponible'

                    setUbicacion({
                        lat,
                        lng,
                        direccion,
                    })
                } catch (error) {
                    console.error('Error en reverse geocoding:', error)
                    setUbicacion({ lat, lng, direccion: 'No disponible' })
                }

                setUbicacionCargada(true)
            },
            (error) => {
                console.error('Permiso de ubicación denegado:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Ubicación no permitida',
                    text: 'Debes permitir el acceso a tu ubicación para registrar afiliados.',
                })
                setUbicacionCargada(true)
            }
        )
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!ubicacion) {
            Swal.fire({
                icon: 'warning',
                title: 'Ubicación requerida',
                text: 'Debes permitir acceso a tu ubicación para registrar un afiliado.',
            })
            return
        }

        const afiliadosRef = ref(database, 'afiliados')

        try {
            const snapshot = await get(afiliadosRef)
            const data = snapshot.val()

            if (data) {
                const afiliadoExistente = Object.values(data).find(
                    (a) => a.credencialId === formData.credencialId
                )

                if (afiliadoExistente) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Afiliado ya registrado',
                        html: `
              <b>Nombre:</b> ${afiliadoExistente.nombre}<br>
              <b>Fecha:</b> ${new Date(afiliadoExistente.timestamp).toLocaleString()}<br>
              <b>Ubicación:</b> ${afiliadoExistente.ubicacion?.direccion || 'No disponible'
                            }
            `,
                    })
                    setFormData({
                        credencialId: '',
                        nombre: '',
                        telefono: '',
                        sector: '',
                    })

                    return
                }
            }

            const nuevoAfiliado = {
                ...formData,
                afiliador: userInfo?.nombreCompleto || 'Desconocido',
                timestamp: new Date().toISOString(),
                ubicacion,
            }

            await push(afiliadosRef, nuevoAfiliado)

            Swal.fire({
                icon: 'success',
                title: 'Afiliado registrado con éxito',
            })

            setFormData({
                credencialId: '',
                nombre: '',
                telefono: '',
                sector: '',
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al registrar',
                text: error.message,
            })
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Registrar Afiliado</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {['credencialId', 'nombre', 'telefono', 'sector'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                                <input
                                    type="text"
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder={`Escribe el ${field}`}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={!ubicacionCargada}
                            className={`w-full font-bold py-2 px-4 rounded-xl transition ${ubicacionCargada
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            {ubicacionCargada ? 'Registrar' : 'Obteniendo ubicación...'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
