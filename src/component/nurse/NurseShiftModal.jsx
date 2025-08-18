import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const NurseShiftModal = ({ nurse = {}, onClose, onSubmit, loading }) => {
  // Initialisation sécurisée du state
  const [shiftData, setShiftData] = useState({
    nurseId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    shiftType: 'morning'
  });

  // Mise à jour sécurisée quand nurse est disponible
  useEffect(() => {
    if (nurse?._id) {
      setShiftData(prev => ({
        ...prev,
        nurseId: nurse._id
      }));
    }
  }, [nurse]);

  const handleChange = (e) => {
    setShiftData({
      ...shiftData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(shiftData);
  };

  // Garde-clause si nurse est vide
  if (!nurse?._id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <p className="text-red-500">Erreur : Aucune infirmière sélectionnée</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Planifier une garde</h2>
          <p className="text-gray-600 mb-4">Pour {nurse?.name || 'Infirmière inconnue'}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={shiftData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de garde *</label>
                <select
                  name="shiftType"
                  value={shiftData.shiftType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="morning">Matin (6h-14h)</option>
                  <option value="afternoon">Après-midi (14h-22h)</option>
                  <option value="night">Nuit (22h-6h)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Planifier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NurseShiftModal;