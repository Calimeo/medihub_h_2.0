import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '@/axios/axios';
import Calendar from '@/component/nurse/Calendar';
import NurseShiftModal from '@/component/nurse/NurseShiftModal';

const NurseShiftsPage = () => {
  const [nurses, setNurses] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const navigate = useNavigate();

  // Fetch all nurses and their shifts
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch nurses
      const nursesRes = await API.get('/api/nurses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNurses(nursesRes.data.nurses);
      
      // Fetch shifts
      const shiftsRes = await API.get('/api/nurses/shifts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShifts(shiftsRes.data.shifts);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle date selection from calendar
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowShiftModal(true);
  };

  // Handle shift creation
  const handleCreateShift = async (shiftData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await API.post('/api/nurses/shifts', shiftData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      setShowShiftModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Planning des Gardes</h1>
        <button
          onClick={() => navigate('/nurses')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Retour à la liste
        </button>
      </div>

      {/* Calendar Component */}
      <Calendar 
        events={shifts.map(shift => ({
          id: shift._id,
          title: shift.nurse.name,
          start: new Date(shift.date),
          end: new Date(new Date(shift.date).setHours(
            shift.shiftType === 'morning' ? 14 :
            shift.shiftType === 'afternoon' ? 22 : 6
          )),
          extendedProps: {
            shiftType: shift.shiftType,
            completed: shift.completed,
            nurseId: shift.nurse._id
          }
        }))}
        onDateClick={handleDateClick}
      />

      {/* Shift Creation Modal */}
      {showShiftModal && (
        <NurseShiftModal
          date={selectedDate}
          nurses={nurses}
          onClose={() => setShowShiftModal(false)}
          onSubmit={handleCreateShift}
          loading={loading}
        />
      )}
    </div>
  );
};

export default NurseShiftsPage;