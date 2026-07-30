
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, 
  Palmtree, 
  Home, 
  Building, 
  HeartHandshake, 
  Bed, 
  CarFront, 
  Tent, 
  Sparkles, 
  Ship, 
  HomeIcon,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";

const propertyTypes = [
  { id: "HOTEL", name: "Khách sạn", icon: Building2, desc: "Chỗ nghỉ lý tưởng cho mọi du khách với đầy đủ tiện nghi." },
  { id: "RESORT", name: "Khu nghỉ dưỡng", icon: Palmtree, desc: "Trải nghiệm kỳ nghỉ thư giãn với dịch vụ cao cấp." },
  { id: "VILLA", name: "Biệt thự", icon: Home, desc: "Không gian riêng tư, sang trọng cho gia đình và nhóm bạn." },
  { id: "APARTMENT", name: "Căn hộ", icon: Building, desc: "Không gian sống thoải mái như ở nhà." },
  { id: "HOMESTAY", name: "Homestay", icon: HeartHandshake, desc: "Trải nghiệm văn hóa địa phương gần gũi, ấm cúng." },
  { id: "GUESTHOUSE", name: "Nhà nghỉ", icon: Bed, desc: "Chỗ nghỉ bình dân, tiện lợi cho khách du lịch." },
  { id: "MOTEL", name: "Motel", icon: CarFront, desc: "Chỗ dừng chân tiện lợi dọc đường." },
  { id: "CAMPING", name: "Khu cắm trại", icon: Tent, desc: "Trải nghiệm hòa mình với thiên nhiên hoang dã." },
  { id: "GLAMPING", name: "Glamping", icon: Sparkles, desc: "Cắm trại sang chảnh với đầy đủ tiện nghi cao cấp." },
  { id: "CRUISE", name: "Du thuyền", icon: Ship, desc: "Kỳ nghỉ trên mặt nước với trải nghiệm độc đáo." },
  { id: "ENTIRE_HOUSE", name: "Nguyên căn nhà", icon: HomeIcon, desc: "Thuê toàn bộ căn nhà cho kỳ nghỉ riêng tư tuyệt đối." },
];

export default function PropertyTypeSelection() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  useEffect(() => {
    if (!user || user.role !== "AGENT") {
      navigate("/partner/login");
    }
  }, [user, navigate]);

  const handleSelect = (typeId: string) => {
    // Navigate to create property page with the selected type
    // Currently we just navigate to dashboard or a create page
    navigate(`/partner/dashboard?create=true&type=${typeId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-primary h-16 flex items-center px-4 md:px-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            NestBooking
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-slate-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-4">
            Bạn muốn đăng chỗ nghỉ nào lên NestBooking?
          </h1>
          <p className="text-slate-600 text-lg">
            Hãy bắt đầu bằng việc chọn loại chỗ nghỉ bạn muốn đăng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {propertyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-8 h-8 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{type.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{type.desc}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

