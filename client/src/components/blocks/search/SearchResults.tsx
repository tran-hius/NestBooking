import PropertyCard, { PropertyProps } from "./PropertyCard";
import HaNoi from "@/assets/HaNoi.jpg";
import HaLong from "@/assets/HaLong.jpg";
import DaNang from "@/assets/DaNang.jpg";
import NinhBinh from "@/assets/NinhBinh.jpg";

const MOCK_PROPERTIES: PropertyProps[] = [
  {
    id: "1",
    name: "Lotusama Central Hanoi Hotel",
    image: HaNoi,
    rating: 4.5,
    reviewCount: 310,
    reviewText: "Tuyệt vời",
    distance: "1 km từ trung tâm",
    roomType: "Phòng Superior Giường Đôi",
    bedType: "1 giường đôi lớn",
    hasBreakfast: false,
    freeCancellation: true,
    noPrepayment: true,
    leftCount: 2,
    originalPrice: "VND 1.500.000",
    salePrice: "VND 1.277.938",
  },
  {
    id: "2",
    name: "Loom Hotel Hanoi",
    image: HaLong,
    rating: 5,
    reviewCount: 41,
    reviewText: "Tuyệt hảo",
    distance: "1.1 km từ trung tâm",
    roomType: "Phòng Tiêu Chuẩn Giường Đôi Không Cửa Sổ",
    bedType: "1 giường đôi",
    hasBreakfast: true,
    freeCancellation: true,
    noPrepayment: true,
    leftCount: 5,
    originalPrice: "VND 2.500.000",
    salePrice: "VND 1.831.500",
  },
  {
    id: "3",
    name: "Riverside Resort & Spa Da Nang",
    image: DaNang,
    rating: 4,
    reviewCount: 1205,
    reviewText: "Rất tốt",
    distance: "2.5 km từ trung tâm",
    roomType: "Phòng Deluxe Hướng Biển",
    bedType: "2 giường đơn hoặc 1 giường đôi lớn",
    hasBreakfast: true,
    freeCancellation: false,
    noPrepayment: false,
    salePrice: "VND 2.150.000",
  },
  {
    id: "4",
    name: "Ninh Binh Hidden Charm Hotel",
    image: NinhBinh,
    rating: 4.5,
    reviewCount: 856,
    reviewText: "Tuyệt vời",
    distance: "0.5 km từ trung tâm",
    roomType: "Suite Nhìn Ra Vườn",
    bedType: "1 giường đôi cực lớn",
    hasBreakfast: true,
    freeCancellation: true,
    noPrepayment: true,
    leftCount: 1,
    originalPrice: "VND 3.200.000",
    salePrice: "VND 2.750.000",
  }
];

export default function SearchResults() {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">
          Hà Nội: Tìm thấy {MOCK_PROPERTIES.length} chỗ nghỉ
        </h2>
        
        <div className="flex items-center gap-4">
          <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-full px-4 py-2 outline-none focus:border-primary cursor-pointer font-medium shadow-sm">
            <option>Sắp xếp theo: Lựa chọn hàng đầu</option>
            <option>Giá (ưu tiên thấp nhất)</option>
            <option>Đánh giá của khách</option>
            <option>Khoảng cách từ trung tâm</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_PROPERTIES.map(prop => (
          <PropertyCard key={prop.id} prop={prop} />
        ))}
      </div>
    </div>
  );
}
