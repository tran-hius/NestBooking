import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CalendarDropdownProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  onClose?: () => void;
}

export default function CalendarDropdown({
  checkIn,
  checkOut,
  onChange,
  onClose,
}: CalendarDropdownProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="absolute top-full left-0 mt-2 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl z-50">
      <h3 className="mb-4 font-bold text-slate-900">Chọn ngày lưu trú</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Ngày nhận phòng
          <Input
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => {
              const nextCheckIn = event.target.value;
              const nextCheckOut = checkOut > nextCheckIn ? checkOut : "";
              onChange(nextCheckIn, nextCheckOut);
            }}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Ngày trả phòng
          <Input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(event) => onChange(checkIn, event.target.value)}
          />
        </label>
      </div>
      <div className="mt-5 flex gap-2 w-full">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            onChange("", "");
            if (onClose) onClose();
          }}
        >
          Bỏ qua
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={Boolean((checkIn || checkOut) && (!checkIn || !checkOut || checkOut <= checkIn))}
          onClick={onClose}
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
}
