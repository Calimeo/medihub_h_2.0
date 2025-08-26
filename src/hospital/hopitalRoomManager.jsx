import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  HomeIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import RoomList from '@/component/room/RoomList';
import RoomForm from '@/component/room/RoomForm';
import BedManagement from '@/component/room/BedManagement';
import RoomStats from '@/component/room/RoomStats';

const HospitalRoomManagement = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const tabs = [
    { id: 'rooms', name: 'Chambres', icon: HomeIcon },
    { id: 'stats', name: 'Statistiques', icon: ChartBarIcon },
  ];

  const handleRoomCreated = () => {
    setShowRoomForm(false);
    setRefresh(prev => prev + 1);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setActiveTab('beds');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Chambres</h1>
              <p className="text-gray-600 mt-2">Gérez les chambres et lits de votre hôpital</p>
            </div>
            <button
              onClick={() => setShowRoomForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nouvelle Chambre
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
                    ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'rooms' && (
          <RoomList 
            onSelectRoom={handleSelectRoom}
            refresh={refresh}
          />
        )}

        {activeTab === 'beds' && selectedRoom && (
          <BedManagement 
            room={selectedRoom}
            onBack={() => {
              setSelectedRoom(null);
              setActiveTab('rooms');
            }}
            onUpdate={() => setRefresh(prev => prev + 1)}
          />
        )}

        {activeTab === 'stats' && (
          <RoomStats />
        )}
      </div>

      {/* Room Creation Modal */}
      {showRoomForm && (
        <RoomForm 
          onClose={() => setShowRoomForm(false)}
          onSuccess={handleRoomCreated}
        />
      )}
    </div>
  );
};

export default HospitalRoomManagement;