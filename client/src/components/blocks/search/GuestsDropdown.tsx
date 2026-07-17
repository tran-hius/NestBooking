import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export default function GuestsDropdown({ onClose }: { onClose?: () => void }) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const Counter = ({ 
    label, 
    value, 
    onIncrement, 
    onDecrement, 
    min = 0 
  }: { 
    label: string, 
    value: number, 
    onIncrement: () => void, 
    onDecrement: () => void, 
    min?: number 
  }) => (
    <div className="flex items-center justify-between py-3">
      <span className="font-medium text-slate-800">{label}</span>
      <div className="flex items-center gap-4">
        <button 
          onClick={onDecrement}
          disabled={value <= min}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-4 text-center font-bold text-slate-900">{value}</span>
        <button 
          onClick={onIncrement}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-6 w-80 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col divide-y divide-slate-100">
        <Counter 
          label="Người lớn" 
          value={adults} 
          min={1}
          onIncrement={() => setAdults(a => a + 1)} 
          onDecrement={() => setAdults(a => Math.max(1, a - 1))} 
        />
        <Counter 
          label="Trẻ em" 
          value={children} 
          onIncrement={() => setChildren(c => c + 1)} 
          onDecrement={() => setChildren(c => Math.max(0, c - 1))} 
        />
        <Counter 
          label="Phòng" 
          value={rooms} 
          min={1}
          onIncrement={() => setRooms(r => r + 1)} 
          onDecrement={() => setRooms(r => Math.max(1, r - 1))} 
        />
      </div>
      <button 
        onClick={onClose}
        className="w-full mt-4 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-blue-50 transition"
      >
        Xong
      </button>
    </div>
  );
}
