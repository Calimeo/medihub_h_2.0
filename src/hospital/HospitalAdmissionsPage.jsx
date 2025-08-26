import React, { useState } from 'react';
import { 
  PlusIcon, 
  UserIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import AdmissionList from '@/component/admission/AdmissionList';
import AdmissionForm from '@/component/admission/AdmissionForm';
import AdmissionStats from '@/component/admission/AdmissionStats';

const AdmissionManagement = () => {
  const [activeTab, setActiveTab] = useState('admissions');
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const tabs = [
    { id: 'admissions', name: 'Admissions', icon: UserIcon },
    { id: 'stats', name: 'Statistiques', icon: ChartBarIcon },
  ];

  const handleAdmissionCreated = () => {
    setShowAdmissionForm(false);
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Admissions</h1>
              <p className="text-gray-600 mt-2">Admission et gestion des patients</p>
            </div>
            <button
              onClick={() => setShowAdmissionForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nouvelle Admission
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'admissions' && (
          <AdmissionList refresh={refresh} />
        )}

        {activeTab === 'stats' && (
          <AdmissionStats />
        )}
      </div>

      {/* Admission Form Modal */}
      {showAdmissionForm && (
        <AdmissionForm 
          onClose={() => setShowAdmissionForm(false)}
          onSuccess={handleAdmissionCreated}
        />
      )}
    </div>
  );
};

export default AdmissionManagement;