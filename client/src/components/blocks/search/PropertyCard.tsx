import { Heart, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PropertyProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  reviewText: string;
  distance: string;
  roomType: string;
  bedType: string;
  hasBreakfast: boolean;
  freeCancellation: boolean;
  noPrepayment: boolean;
  leftCount?: number;
  originalPrice?: string;
  salePrice: string;
}

export default function PropertyCard({ prop }: { prop: PropertyProps }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      
      {/* Image Section */}
      <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 overflow-hidden rounded-xl">
        <img src={prop.image} alt={prop.name} className="w-full h-full object-cover" />
        <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm backdrop-blur-sm">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Details Section */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-primary">{prop.name}</h3>
                <div className="flex text-amber-500 text-sm">
                  {'★'.repeat(Math.floor(prop.rating))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary underline mb-2">
                <MapPin className="w-3 h-3" />
                <a href="#" className="hover:text-blue-700">Hiển thị trên bản đồ</a>
                <span className="text-slate-500 no-underline">• {prop.distance}</span>
              </div>
            </div>

            {/* Rating Box */}
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <div className="font-bold text-slate-900">{prop.reviewText}</div>
                <div className="text-xs text-slate-500">{prop.reviewCount} đánh giá</div>
              </div>
              <div className="bg-primary text-white font-bold text-lg p-2 rounded-lg rounded-br-none shadow-sm flex items-center justify-center w-10 h-10">
                {prop.rating}
              </div>
            </div>
          </div>

          <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">{prop.roomType}</h4>
            <p className="text-xs text-slate-600">{prop.bedType}</p>
            
            <div className="pt-1 space-y-1">
              {prop.hasBreakfast && (
                <div className="text-green-600 font-bold text-xs">Bao gồm bữa sáng</div>
              )}
              {prop.freeCancellation && (
                <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                  <Check className="w-3 h-3" /> Miễn phí hủy phòng
                </div>
              )}
              {prop.noPrepayment && (
                <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                  <Check className="w-3 h-3" /> Không cần thanh toán trước
                </div>
              )}
            </div>
            
            {prop.leftCount && (
              <div className="text-red-500 font-bold text-xs mt-1">
                Chỉ còn {prop.leftCount} phòng với giá này trên trang của chúng tôi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="w-full md:w-48 flex flex-col justify-end items-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-xs text-slate-500 mb-1">1 đêm, 2 người lớn</div>
        
        {prop.originalPrice && (
          <div className="text-sm text-red-500 line-through font-medium">
            {prop.originalPrice}
          </div>
        )}
        
        <div className="text-2xl font-black text-slate-900 mb-1">
          {prop.salePrice}
        </div>
        
        <div className="text-xs text-slate-500 mb-4 text-right">
          Đã bao gồm thuế và phí
        </div>
        
        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-md h-10">
          Xem chỗ trống
        </Button>
      </div>

    </div>
  );
}
