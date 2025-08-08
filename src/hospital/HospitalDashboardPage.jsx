import React, { useEffect, useState } from "react";
import API from "@/axios/axios.js";

// Simule une récupération de données locales (par exemple depuis localStorage ou d'autres composants)
function loadDummyStats() {
  const rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  const admissions = JSON.parse(localStorage.getItem("admissions")) || [];
  const medicines = JSON.parse(localStorage.getItem("medicines")) || [];
  const supplies = JSON.parse(localStorage.getItem("supplies")) || [];
  const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
  const services = JSON.parse(localStorage.getItem("services")) || [];

  const bedsTotal = rooms.reduce((sum, r) => sum + r.beds.length, 0);
  const bedsOccupied = rooms.reduce(
    (sum, r) => sum + r.beds.filter((b) => !b.available).length,
    0
  );

  const today = new Date().toISOString().split("T")[0];

  const todayAdmissions = admissions.filter((a) => a.admissionDate === today).length;
  const todayDischarges = admissions.filter((a) => a.dischargeDate === today).length;

  const medicinesInStock = medicines.reduce((sum, m) => sum + m.stock, 0);
  const suppliesInStock = supplies.reduce((sum, s) => sum + s.stock, 0);

  return {
    totalServices: services.length,
    totalDoctors: doctors.length,
    bedsOccupied,
    bedsTotal,
    todayAdmissions,
    todayDischarges,
    medicinesInStock,
    suppliesInStock,
  };
}

function progressPercent(current, total) {
  return Math.min(100, Math.round((current / total) * 100));
}

export default function HospitalDashboardPage() {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalDoctors: 0,
    bedsOccupied: 0,
    bedsTotal: 0,
    todayAdmissions: 0,
    todayDischarges: 0,
    medicinesInStock: 0,
    suppliesInStock: 0,
  });

  useEffect(() => {
    const loadedStats = loadDummyStats();
    setStats(loadedStats);
  }, []);

  return (
    <div className="bg-white rounded shadow p-8 max-w-7xl mx-auto space-y-12">
      <h1 className="text-3xl font-extrabold text-red-700 mb-6 text-center">
        Tableau de bord global
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="p-6 bg-red-50 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-700">
            Services offerts
          </h2>
          <p className="text-5xl font-bold text-red-900">{stats.totalServices}</p>
        </div>
        <div className="p-6 bg-red-50 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-700">Médecins</h2>
          <p className="text-5xl font-bold text-red-900">{stats.totalDoctors}</p>
        </div>
        <div className="p-6 bg-red-50 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-700">
            Lits occupés / total
          </h2>
          <p className="text-5xl font-bold text-red-900">
            {stats.bedsOccupied} / {stats.bedsTotal}
          </p>
          <div className="w-full bg-red-200 rounded h-2 mt-2">
            <div
              className="bg-red-600 h-2 rounded"
              style={{ width: `${progressPercent(stats.bedsOccupied, stats.bedsTotal)}%` }}
            />
          </div>
        </div>
        <div className="p-6 bg-red-50 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-700">
            Admissions aujourd'hui
          </h2>
          <p className="text-5xl font-bold text-red-900">{stats.todayAdmissions}</p>
          <h3 className="text-lg font-semibold mt-4 text-red-700">
            Sorties aujourd'hui
          </h3>
          <p className="text-4xl font-bold text-red-900">{stats.todayDischarges}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="p-6 bg-red-50 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-700">Stocks de médicaments</h2>
          <p className="text-5xl font-bold text-red-900">{stats.medicinesInStock}</p>
        </div>
        <div className="p-6 bg-red-50 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-red-700">Stocks de fournitures</h2>
          <p className="text-5xl font-bold text-red-900">{stats.suppliesInStock}</p>
        </div>
      </div>
    </div>
  );
}
