import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export interface GuestSelection {
  adults: number;
  children: number;
  rooms: number;
}

interface GuestsDropdownProps extends GuestSelection {
  onChange: (selection: GuestSelection) => void;
  onClose?: () => void;
}

export default function GuestsDropdown({
  adults: initialAdults,
  children: initialChildren,
  rooms: initialRooms,
  onChange,
  onClose,
}: GuestsDropdownProps) {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(initialRooms);

  const Counter = ({
    label,
    value,
    onIncrement,
    onDecrement,
    min = 0,
  }: {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    min?: number;
  }) => (
    <div className="flex items-center justify-between py-3">
      <span className="font-medium text-slate-800">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onDecrement} disabled={value <= min} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-50">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-4 text-center font-bold text-slate-900">{value}</span>
        <button type="button" onClick={onIncrement} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-50">
      <div className="flex flex-col divide-y divide-slate-100">
        <Counter label="Người lớn" value={adults} min={1} onIncrement={() => setAdults((value) => value + 1)} onDecrement={() => setAdults((value) => Math.max(1, value - 1))} />
        <Counter label="Trẻ em" value={children} onIncrement={() => setChildren((value) => value + 1)} onDecrement={() => setChildren((value) => Math.max(0, value - 1))} />
        <Counter label="Phòng" value={rooms} min={1} onIncrement={() => setRooms((value) => value + 1)} onDecrement={() => setRooms((value) => Math.max(1, value - 1))} />
      </div>
      <button
        type="button"
        onClick={() => {
          onChange({ adults, children, rooms });
          onClose?.();
        }}
        className="mt-4 w-full rounded-xl border-2 border-primary py-3 font-bold text-primary hover:bg-blue-50"
      >
        Xong
      </button>
    </div>
  );
}
