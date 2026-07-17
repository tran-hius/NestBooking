import { Search, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SidebarFilters() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search by property name */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3">Tìm kiếm theo tên</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Tên khách sạn..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Map Widget */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 relative group cursor-pointer h-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://maps.gstatic.com/mapfiles/api-3/images/staticmap_default2.png')] bg-cover bg-center opacity-70 group-hover:opacity-100 transition-opacity"></div>
        <Button className="relative z-10 bg-white text-primary border border-primary hover:bg-blue-50 font-bold shadow-lg">
          <Map className="w-4 h-4 mr-2" />
          Hiển thị trên bản đồ
        </Button>
      </div>

      {/* Filters Box */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
        
        {/* Budget */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Ngân sách của bạn (mỗi đêm)
          </h3>
          <div className="px-2">
            <input 
              type="range" 
              min="0" 
              max="5000000" 
              defaultValue="2000000"
              className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-slate-600 mt-2 font-medium">
              <span>VND 0</span>
              <span>VND 5.000.000+</span>
            </div>
          </div>
        </div>

        {/* Popular Filters */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Lọc phổ biến
          </h3>
          <div className="flex flex-col gap-3">
            {['Gần trung tâm', 'Bao gồm bữa sáng', 'Hồ bơi', 'Bãi đậu xe', 'Bồn tắm'].map(filter => (
              <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{filter}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Loại hình chỗ ở
          </h3>
          <div className="flex flex-col gap-3">
            {['Khách sạn', 'Căn hộ', 'Resort', 'Biệt thự', 'Nhà nghỉ B&B'].map(filter => (
              <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{filter}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
