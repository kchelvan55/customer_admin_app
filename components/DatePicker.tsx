
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  id?: string;
  initialOpen?: boolean; // Added prop
  showClearButton?: boolean; // New prop for showing clear button
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  selectedDate, 
  onChange, 
  minDate, 
  maxDate, 
  label, 
  id, 
  initialOpen, // Destructure prop
  showClearButton = false // Destructure new prop with default value
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen || false); // Use prop for initial state
  
  const initialDisplayMonth = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate) return selectedDate;
    if (minDate && minDate > today) return minDate;
    return today;
  }, [selectedDate, minDate]);
  
  const [displayMonth, setDisplayMonth] = useState<Date>(initialDisplayMonth);

  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setDisplayMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    } else if (minDate && !selectedDate) { // Only set based on minDate if no selectedDate
      setDisplayMonth(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
    } else if (!selectedDate && !minDate) { // Default to today if no selection and no minDate
        setDisplayMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    }
  }, [selectedDate, minDate]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) { // Only add listener if open
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]); // Re-run effect if isOpen changes

  const formatDateForInputDisplay = (date: Date | null): string => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const handlePrevMonth = () => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClearDate = () => {
    onChange(null);
    setIsOpen(false);
  };

  const renderDays = () => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const numDays = daysInMonth(year, month);
    let firstDay = firstDayOfMonth(year, month); 
    firstDay = (firstDay === 0) ? 6 : firstDay -1; // Adjust so Monday is 0, Sunday is 6 for typical calendar layout start

    const today = new Date();
    today.setHours(0,0,0,0);

    const dayElements = [];

    // Blank cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      dayElements.push(<div key={`blank-${i}`} className="w-1/7 p-1"></div>);
    }

    // Actual days of the month
    for (let day = 1; day <= numDays; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0,0,0,0);

      let isDisabled = false;
      if (minDate && currentDate < new Date(minDate.setHours(0,0,0,0))) isDisabled = true;
      if (maxDate && currentDate > new Date(maxDate.setHours(0,0,0,0))) isDisabled = true;
      
      const isSelected = selectedDate && currentDate.getTime() === new Date(selectedDate.setHours(0,0,0,0)).getTime();
      const isToday = currentDate.getTime() === today.getTime();

      dayElements.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateClick(currentDate)}
          disabled={isDisabled}
          className={`w-full aspect-square flex items-center justify-center rounded-full text-sm
            ${isSelected ? 'bg-primary text-white' : 
            isDisabled ? 'text-neutral-DEFAULT cursor-not-allowed' :
            isToday ? 'text-primary border border-primary' : 'text-neutral-darker hover:bg-neutral-light'
            }`}
          aria-pressed={isSelected}
          aria-label={currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
          {day}
        </button>
      );
    }
    return dayElements;
  };
  
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Start with Monday

  return (
    <div className="relative" ref={datePickerRef}>
      {label && <label htmlFor={id || 'date-picker-input'} className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>}
      <button
        id={id || 'date-picker-input'}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-neutral-DEFAULT rounded-lg bg-white text-neutral-darker focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{formatDateForInputDisplay(selectedDate)}</span>
        <Icon name="calendar" className="w-5 h-5 text-neutral-dark" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-72 bg-white border border-neutral-DEFAULT rounded-lg shadow-lg p-3 z-50">
          <div className="flex items-center justify-between mb-3">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-neutral-light" aria-label="Previous month">
              <Icon name="chevronLeft" className="w-5 h-5 text-neutral-darker" />
            </button>
            <span className="font-semibold text-neutral-darker">
              {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-neutral-light" aria-label="Next month">
              <Icon name="chevronLeft" className="w-5 h-5 text-neutral-darker transform rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-dark mb-2">
            {weekdays.map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>
          {showClearButton && selectedDate && (
            <div className="mt-3 pt-3 border-t border-neutral-light">
              <button
                onClick={handleClearDate}
                className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md transition-colors"
              >
                Clear Date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
