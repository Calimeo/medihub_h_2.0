import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = ({ events, onDateClick }) => {
  const handleSelectSlot = (slotInfo) => {
    onDateClick(slotInfo.start);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    if (event.extendedProps.completed) {
      backgroundColor = '#10B981'; // Vert pour terminé
    } else {
      backgroundColor = event.extendedProps.shiftType === 'morning' 
        ? '#F59E0B' // Jaune pour matin
        : event.extendedProps.shiftType === 'afternoon' 
          ? '#F97316' // Orange pour après-midi
          : '#3B82F6'; // Bleu pour nuit
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="h-[600px]">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        defaultView="week"
        views={['day', 'week', 'month']}
        step={60}
        timeslots={1}
        eventPropGetter={eventStyleGetter}
        messages={{
          today: "Aujourd'hui",
          previous: "Précédent",
          next: "Suivant",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          date: "Date",
          time: "Heure",
          event: "Événement",
          noEventsInRange: "Aucune garde prévue"
        }}
      />
    </div>
  );
};

export default Calendar;