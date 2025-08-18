import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";
import { useParams } from "react-router-dom";

export default function HospitalBedsPage() {
  const { hospitalId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [bedNumberInput, setBedNumberInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hospitalId) {
      fetchRooms();
    }
  }, [hospitalId]);

  const fetchRooms = async () => {
    try {
      const res = await API.get(`/api/hospitals/${hospitalId}/rooms`);
      setRooms(res.data);
    } catch (err) {
      toast.error("Erreur de chargement des chambres.");
      console.error("Détails:", err.response?.data);
    }
  };

  const addRoom = async () => {
    setError("");
    if (!roomNameInput.trim()) {
      setError("Le nom de la chambre est requis.");
      return;
    }

    try {
      await API.post(`/api/hospitals/${hospitalId}/rooms`, {
        name: roomNameInput.trim(),
      });
      toast.success("Chambre ajoutée.");
      setRoomNameInput("");
      fetchRooms();
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'ajout de la chambre."
      );
    }
  };

  const deleteRoom = async (id) => {
    if (window.confirm("Confirmer la suppression de la chambre ?")) {
      try {
        await API.delete(`/api/hospitals/${hospitalId}/rooms/${id}`);
        toast.success("Chambre supprimée.");
        if (selectedRoomId === id) setSelectedRoomId(null);
        fetchRooms();
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const addBed = async () => {
    setError("");
    if (!bedNumberInput.trim()) {
      setError("Le numéro du lit est requis.");
      return;
    }

    try {
      await API.post(`/api/rooms/${selectedRoomId}/beds`, {
        number: bedNumberInput.trim(),
        hospitalId // Important: envoie hospitalId dans le body comme requis
      });
      toast.success("Lit ajouté.");
      setBedNumberInput("");
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du lit.");
    }
  };

  const toggleBedAvailability = async (roomId, bedId) => {
    try {
      await API.put(
        `/api/hospitals/${hospitalId}/rooms/${roomId}/beds/${bedId}/toggle`
      );
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const deleteBed = async (roomId, bedId) => {
    if (window.confirm("Confirmer la suppression du lit ?")) {
      try {
        await API.delete(
          `/api/hospitals/${hospitalId}/rooms/${roomId}/beds/${bedId}`
        );
        toast.success("Lit supprimé.");
        fetchRooms();
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const selectedRoom = rooms.find((r) => r._id === selectedRoomId);

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded shadow space-y-12">
      <h1 className="text-3xl font-bold text-red-700 text-center mb-6">
        Gestion des lits et chambres - Hôpital {hospitalId}
      </h1>

      <section>
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Chambres</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nom nouvelle chambre"
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                className="flex-grow px-3 py-2 border rounded border-gray-300 focus:ring-red-500 focus:border-red-500"
              />
              <button
                onClick={addRoom}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold transition"
              >
                Ajouter
              </button>
            </div>

            {rooms.length === 0 ? (
              <p className="italic text-gray-600">Aucune chambre créée.</p>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto rounded border border-gray-300">
                {rooms.map(({ _id, name }) => (
                  <li
                    key={_id}
                    className={`px-4 py-3 cursor-pointer hover:bg-red-50 flex justify-between items-center ${
                      selectedRoomId === _id
                        ? "bg-red-100 font-semibold text-red-900"
                        : ""
                    }`}
                    onClick={() => setSelectedRoomId(_id)}
                    role="button"
                  >
                    <span>{name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoom(_id);
                      }}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:w-2/3">
            <h3 className="font-semibold text-lg mb-3">
              Lits {selectedRoom ? `(chambre ${selectedRoom.name})` : ""}
            </h3>
            {!selectedRoom ? (
              <p className="italic text-gray-600">Veuillez sélectionner une chambre.</p>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Numéro du lit"
                    value={bedNumberInput}
                    onChange={(e) => setBedNumberInput(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded border-gray-300 focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={addBed}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold transition"
                  >
                    Ajouter lit
                  </button>
                </div>
                {selectedRoom.beds?.length === 0 ? (
                  <p className="italic text-gray-600">Aucun lit créé.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 border border-gray-300 rounded max-h-[350px] overflow-y-auto">
                    {selectedRoom.beds?.map((bed) => (
                      <li
                        key={bed._id}
                        className="flex justify-between items-center px-4 py-3 hover:bg-red-50"
                      >
                        <span>{bed.number}</span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              toggleBedAvailability(selectedRoom._id, bed._id)
                            }
                            className={`px-3 py-1 rounded font-semibold transition ${
                              bed.available
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                            }`}
                          >
                            {bed.available ? "Disponible" : "Indisponible"}
                          </button>
                          <button
                            onClick={() =>
                              deleteBed(selectedRoom._id, bed._id)
                            }
                            className="text-red-600 hover:text-red-800 font-bold text-xl"
                          >
                            &times;
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {error && (
              <p className="text-red-600 font-semibold mt-4 text-center">{error}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}