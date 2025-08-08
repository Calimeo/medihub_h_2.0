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
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6 text-emerald-700">Patients enregistrés</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex w-full md:w-1/2 bg-white border rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700">
            <FaSearch />
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={exportExcel} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2">
            <FaFileExcel /> Excel
          </button>
          <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2">
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full table-auto">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Date de naissance</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="text-center border-b">
                <td className="px-4 py-3">{p.fullName}</td>
                <td className="px-4 py-3">{p.dateOfBirth}</td>
                <td className="px-4 py-3">{p.contact.phone}</td>
                <td className="px-4 py-3">{p.gender}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-gray-500 text-center">Aucun patient trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalPatientsPage;
