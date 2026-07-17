import SearchHeader from "@/components/blocks/search/SearchHeader";
import SidebarFilters from "@/components/blocks/search/SidebarFilters";
import SearchResults from "@/components/blocks/search/SearchResults";

export default function Search() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SearchHeader />
      
      <div className="container mx-auto px-4 md:px-8 py-8 flex-1">
        
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
          <span>&gt;</span>
          <a href="#" className="hover:text-primary transition-colors">Việt Nam</a>
          <span>&gt;</span>
          <span className="text-slate-900 font-medium">Kết quả tìm kiếm cho Hà Nội</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4 shrink-0">
            <SidebarFilters />
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-3/4">
            <SearchResults />
          </div>

        </div>
      </div>
    </div>
  );
}
