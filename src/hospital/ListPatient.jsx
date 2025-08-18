import React, { useEffect, useState } from "react";
import { FaSearch, FaTrash, FaEdit, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import API from "@/axios/axios.js";

const HospitalPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");

  const fetchPatients = async () => {
    try {
      const { data } = await API.get("/api/v1/patients", {
        withCredentials: true,
      });
      setPatients(data.patients); // Assure-toi que c’est `data.patients`, pas `data`
    } catch (error) {
      console.error("❌ Erreur lors de l'appel API:", error.response?.data || error.message);
      toast.error("Erreur lors du chargement des patients");
    }
  };


  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce patient ?")) return;
    try {
      await API.delete(`/api/v1/patients/${id}`, { withCredentials: true });
      toast.success("Patient supprimé");
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())
  );

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filtered.map(({ _id, hospitalId, ...p }) => p));
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, "patients.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des patients", 10, 10);
    doc.autoTable({
      startY: 20,
      head: [["Nom", "Email", "Téléphone", "Genre"]],
      body: filtered.map((p) => [
        `${p.firstName} ${p.lastName}`,
        p.email,
        p.phone,
        p.gender,
      ]),
    });
    doc.save("patients.pdf");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 font-sans">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-emerald-700">
        Patients enregistrés
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FaSearch />
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 transform hover:scale-105"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center gap-2 transform hover:scale-105"
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Nom</th>
                <th className="px-6 py-4 text-left">Date de naissance</th>
                <th className="px-6 py-4 text-left">Téléphone</th>
                <th className="px-6 py-4 text-left">Genre</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, index) => (
                <tr
                  key={p._id}
                  className={`border-b text-gray-700 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-emerald-50`}
                >
                  <td className="px-6 py-4 font-semibold">{p.fullName}</td>
                  <td className="px-6 py-4">{p.dateOfBirth}</td>
                  <td className="px-6 py-4">{p.contact.phone}</td>
                  <td className="px-6 py-4">{p.gender}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-gray-500 text-center text-lg">
                    Aucun patient trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalPatientsPage;
