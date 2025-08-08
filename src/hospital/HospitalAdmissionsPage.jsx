import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

export default function HospitalAdmissionsPage() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire state
  const [patientName, setPatientName] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [room, setRoom] = useState("");
  const [bed, setBed] = useState("");

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const { data } = await API.get("/api/admissions");
      setAdmissions(data);
    } catch (err) {
      toast.error("Erreur de chargement des admissions.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
  };

  const markDischarge = async (id) => {
    if (window.confirm("Marquer ce patient comme sorti ?")) {
      try {
        await API.patch(`/api/admissions/${id}/discharge`);
        toast.success("Patient marqué comme sorti.");
        fetchAdmissions();
      } catch (err) {
        toast.error("Erreur lors de la sortie du patient.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !admissionDate || !room || !bed) {
      toast.error("Tous les champs sont requis.");
      return;
    }

    try {
      await API.post("/api/admissions", {
        patientName,
        admissionDate,
        room,
        bed,
      });
      toast.success("Admission ajoutée.");
      setPatientName("");
      setAdmissionDate("");
      setRoom("");
      setBed("");
      fetchAdmissions();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Erreur lors de l’ajout.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded shadow space-y-8">
      <h1 className="text-3xl font-bold text-red-700 text-center">
        Admissions et sorties
      </h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Nom du patient"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />
        <input
          type="date"
          value={admissionDate}
          onChange={(e) => setAdmissionDate(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />
        <input
          type="text"
          placeholder="Chambre"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />
        <input
          type="text"
          placeholder="Lit"
          value={bed}
          onChange={(e) => setBed(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-4 py-2 mt-2 md:col-span-4"
        >
          Ajouter l’admission
        </button>
      </form>

      {/* Liste */}
      {loading ? (
        <p className="text-center text-gray-500 italic">Chargement...</p>
      ) : admissions.length === 0 ? (
        <p className="text-gray-600 italic text-center">
          Aucune admission à afficher.
        </p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded">
          <thead className="bg-red-100 text-red-800 font-semibold">
            <tr>
              <th className="border px-4 py-2 text-left">Patient</th>
              <th className="border px-4 py-2 text-center">Date Admission</th>
              <th className="border px-4 py-2 text-center">Date Sortie</th>
              <th className="border px-4 py-2 text-left">Chambre</th>
              <th className="border px-4 py-2 text-left">Lit</th>
              <th className="border px-4 py-2 text-center">Statut</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((adm) => (
              <tr
                key={adm._id}
                className={`hover:bg-red-50 ${
                  adm.status === "discharged" ? "opacity-60" : ""
                }`}
              >
                <td className="border px-4 py-2">{adm.patientName}</td>
                <td className="border px-4 py-2 text-center">
                  {formatDate(adm.admissionDate)}
                </td>
                <td className="border px-4 py-2 text-center">
                  {formatDate(adm.dischargeDate)}
                </td>
                <td className="border px-4 py-2">{adm.room}</td>
                <td className="border px-4 py-2">{adm.bed}</td>
                <td
                  className={`border px-4 py-2 text-center font-semibold ${
                    adm.status === "admitted"
                      ? "text-green-700"
                      : "text-gray-700 italic"
                  }`}
                >
                  {adm.status === "admitted" ? "Admis" : "Sorti"}
                </td>
                <td className="border px-4 py-2 text-center">
                  {adm.status === "admitted" ? (
                    <button
                      onClick={() => markDischarge(adm._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-semibold transition"
                    >
                      Marquer sortie
                    </button>
                  ) : (
                    <span className="italic text-gray-600">Aucune action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
