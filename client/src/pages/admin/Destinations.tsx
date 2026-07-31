import { useEffect, useState } from "react";
import { Destination, destinationService } from "@/api/services/destinationService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Paperclip } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    country: "Vietnam",
    countryFlag: "🇻🇳",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDestinations = async () => {
    try {
      const res = await destinationService.getAdminDestinations();
      setDestinations(res.data);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      toast.error("Không thể tải danh sách điểm đến");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleToggleFeatured = async (id: string) => {
    try {
      await destinationService.toggleFeatured(id);
      await fetchDestinations();
      toast.success("Đã cập nhật trạng thái nổi bật");
    } catch (error) {
      console.error("Failed to toggle featured status", error);
      toast.error("Không thể cập nhật điểm đến");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa điểm đến này?")) {
      try {
        await destinationService.deleteDestination(id);
        await fetchDestinations();
        toast.success("Đã xóa điểm đến");
      } catch (error) {
        console.error("Failed to delete destination", error);
        toast.error("Không thể xóa điểm đến");
      }
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Vui lòng chọn ảnh điểm đến!");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("country", formData.country);
      data.append("countryFlag", formData.countryFlag);
      data.append("description", formData.description);
      data.append("image", selectedFile);

      await destinationService.createDestination(data);
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        slug: "",
        country: "Vietnam",
        countryFlag: "🇻🇳",
        description: "",
      });
      setSelectedFile(null);
      await fetchDestinations();
      toast.success("Tạo điểm đến thành công!");
    } catch (error: any) {
      console.error("Failed to add destination", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm điểm đến. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Điểm đến</h1>
          <p className="text-slate-500">Chỉ những điểm đến bật "Nổi bật" mới hiển thị trên trang chủ.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Thêm điểm đến
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm điểm đến mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDestination} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên điểm đến</Label>
                <Input
                  id="name"
                  placeholder="VD: Đà Lạt"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="VD: da-lat"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={selectedFile ? selectedFile.name : ""}
                      placeholder="Chưa chọn file nào..."
                      readOnly
                      className="pr-10 cursor-default"
                    />
                    <label 
                      htmlFor="image" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Chọn ảnh"
                    >
                      <Paperclip className="h-5 w-5" />
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                        required={!selectedFile}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Quốc gia</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryFlag">Cờ (Emoji)</Label>
                  <Input
                    id="countryFlag"
                    value={formData.countryFlag}
                    onChange={(e) => setFormData({ ...formData, countryFlag: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Input
                  id="description"
                  placeholder="Thành phố ngàn hoa..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tải lên...
                    </>
                  ) : (
                    "Lưu điểm đến"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
        ) : destinations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Không có dữ liệu.</div>
        ) : (
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-foreground uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Cờ</th>
                <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                <th className="px-6 py-4 font-semibold text-center">Nổi bật</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest) => (
                <tr key={dest.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-foreground">{dest.name}</td>
                  <td className="px-6 py-4">{dest.slug}</td>
                  <td className="px-6 py-4 text-xl">{dest.countryFlag}</td>
                  <td className="px-6 py-4">{new Date(dest.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4 text-center">
                    <Switch
                      checked={dest.isFeatured}
                      onCheckedChange={() => handleToggleFeatured(dest.id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(dest.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
