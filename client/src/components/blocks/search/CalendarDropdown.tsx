import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helpers for calendar generation
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  // Adjust so Monday is the first day of the week (0) instead of Sunday (0)
  const startingDay = firstDay === 0 ? 6 : firstDay - 1; 
  
  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null); // Empty slots before the 1st
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarDropdown({ onClose }: { onClose?: () => void }) {
  // Hardcoded to July 2026 and August 2026 for the mock
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(6); // 0-indexed, 6 = July
  
  const [startDate, setStartDate] = useState<number | null>(18);
  const [endDate, setEndDate] = useState<number | null>(19);

  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const leftDays = generateCalendarDays(currentYear, currentMonth);
  const rightDays = generateCalendarDays(nextMonthYear, nextMonth);

  const handleDayClick = (day: number | null, isRightPanel: boolean = false) => {
    if (day === null) return;
    
    // Simple mock selection logic
    // In a real app, this would compare actual Date objects
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day > startDate || isRightPanel) {
        setEndDate(day);
        if (onClose) onClose();
      } else {
        setStartDate(day);
      }
    }
  };

  const renderMonth = (year: number, month: number, days: (number|null)[], isRightPanel: boolean = false) => (
    <div className="flex-1 w-full p-2">
      <div className="flex items-center justify-between mb-4">
        {!isRightPanel ? (
          <button className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : <div className="w-7 h-7"></div>}
        
        <span className="font-bold text-slate-800">
          {MONTH_NAMES[month]} {year}
        </span>
        
        {isRightPanel ? (
          <button className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : <div className="w-7 h-7"></div>}
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-medium text-slate-500 mb-2">
        {WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-10"></div>;
          
          // Mock selection styling logic
          const isStart = !isRightPanel && day === startDate;
          const isEnd = (!isRightPanel && day === endDate) || (isRightPanel && day === endDate); // Simplification for mock
          const isBetween = !isRightPanel && startDate && endDate && day > startDate && day < endDate;

          let bgClass = "bg-transparent";
          let textClass = "text-slate-800 hover:bg-slate-100";
          let roundedClass = "rounded-full";

          if (isStart || isEnd) {
            bgClass = "bg-primary";
            textClass = "text-white font-bold";
            // Make background connect to the middle
            if (isStart && endDate) roundedClass = "rounded-l-full rounded-r-none";
            if (isEnd && startDate) roundedClass = "rounded-r-full rounded-l-none";
            if (isStart && !endDate) roundedClass = "rounded-full";
          } else if (isBetween) {
            bgClass = "bg-blue-50";
            textClass = "text-slate-800";
            roundedClass = "rounded-none";
          }

          return (
            <div 
              key={day} 
              className={`h-10 flex items-center justify-center cursor-pointer relative ${bgClass} ${roundedClass}`}
              onClick={() => handleDayClick(day, isRightPanel)}
            >
              <span className={`w-10 h-10 flex items-center justify-center ${textClass} ${roundedClass}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden w-[700px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button className="flex-1 py-4 text-center font-bold text-primary border-b-2 border-primary">
          Calendar
        </button>
        <button className="flex-1 py-4 text-center font-medium text-slate-500 hover:bg-slate-50">
          I'm flexible
        </button>
      </div>

      {/* Calendar Area */}
      <div className="p-4 flex gap-4">
        {renderMonth(currentYear, currentMonth, leftDays, false)}
        {renderMonth(nextMonthYear, nextMonth, rightDays, true)}
      </div>

      {/* Flexible Options Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3">
        <span className="font-bold text-slate-800 text-sm">Flexible date options</span>
        <div className="flex gap-2">
          {["Exact dates", "± 1 day", "± 2 days", "± 3 days", "± 7 days"].map((opt, i) => (
            <button 
              key={opt}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${i === 0 ? 'border-primary text-primary bg-blue-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
