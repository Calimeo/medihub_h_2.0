import React, { useState, useEffect } from 'react';
import API from '@/axios/axios';

const WorkHoursReport = ({ nurse, onClose }) => {
  const [hoursData, setHoursData] = useState({
    month: 0,
    year: 0,
    total: nurse.totalHours || 0
  });
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchHours = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await API.get(`/api/nurses/hours?nurseId=${nurse._id}&period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHoursData(prev => ({
          ...prev,
          [period]: data.totalHours,
          shiftsCount: data.shiftsCount
        }));
      } catch (error) {
        console.error('Error fetching hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, [period, nurse._id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Heures travaillées</h2>
              <p className="text-gray-600">{nurse.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium ${period === 'month' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setPeriod('month')}
              >
                Ce mois
              </button>
              <button
                className={`py-2 px-4 font-medium ${period === 'year' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setPeriod('year')}
              >
                Cette année
              </button>
              <button
                className={`py-2 px-4 font-medium ${period === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setPeriod('all')}
              >
                Total
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Heures travaillées</p>
                <p className="text-3xl font-bold text-blue-800">
                  {period === 'month' && hoursData.month}
                  {period === 'year' && hoursData.year}
                  {period === 'all' && hoursData.total}
                  <span className="text-lg">h</span>
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Nombre de gardes</p>
                <p className="text-xl font-medium text-gray-800">
                  {hoursData.shiftsCount || 0}
                </p>
              </div>
              
              <div className="text-sm text-gray-500 mt-4">
                <p>Note: Chaque garde compte pour 8 heures de travail</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkHoursReport;