import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import HeatMapMexico from './HeatMapMexico';
import BarChartAffiliates from './BarChartAffiliates'; // Importa la gráfica de barras
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../credenciales';
import { Link } from 'react-router-dom';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [totalAffiliates, setTotalAffiliates] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      onValue(ref(database, `usuarios/${user.uid}`), (snap) => {
        setUserData(snap.val());
      });
    }
  }, []);

  useEffect(() => {
    const afiliadosRef = ref(database, 'afiliados');
    const unsubscribe = onValue(afiliadosRef, (snap) => {
      const data = snap.val() || {};
      setTotalAffiliates(Object.keys(data).length);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-white shadow rounded p-4">
            <h2 className="font-bold text-lg mb-2">Tus datos</h2>
            <p>
              <strong>Nombre:</strong> {userData?.nombre} {userData?.apellido}
            </p>
            <p>
              <strong>Correo:</strong> {userData?.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {userData?.telefono}
            </p>
          </div>
          <div className="bg-white shadow rounded p-4 flex flex-col items-center justify-center">
            <h2 className="font-bold text-lg mb-2">Total afiliaciones</h2>
            <p className="text-4xl font-semibold">{totalAffiliates}</p>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full h-[400px]">
            <BarChartAffiliates />
          </div>
          <div className="w-full h-[400px]">
            <HeatMapMexico />
          </div>
        </div>
      </div>
    </>
  );
}
