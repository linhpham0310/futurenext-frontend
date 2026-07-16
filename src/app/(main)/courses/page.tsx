'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { courseApi, studentApi, commonApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Search, RefreshCw, AlertCircle, Star, Users, Clock, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  instructor?: {
    id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
  };
  rating?: number;
  students?: number;
  duration?: string;
  level?: string;
  category?: {
    id: string;
    name: string;
  };
  isEnrolled?: boolean;
  createdAt?: string;
  totalLessons?: number;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface FilterState {
  search: string;
  category: string;
  level: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'popular' | 'newest' | 'trending';
}

const PAGE_SIZE = 12;

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    level: '',
    minPrice: 0,
    maxPrice: 10000000,
    minRating: 0,
    sortBy: 'popular',
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await commonApi.getCategories();
        setCategories(res.data?.data || res.data || []);
      } catch {
        console.warn('Không thể tải danh mục');
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        // Sử dụng debouncedSearch thay vì filters.search trực tiếp
        const params: any = {
          page,
          limit: PAGE_SIZE,
          q: debouncedSearch || undefined, // Backend dùng `q`
          category: filters.category || undefined,
          level: filters.level || undefined,
          minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
          maxPrice: filters.maxPrice < 10000000 ? filters.maxPrice : undefined,
          rating: filters.minRating > 0 ? filters.minRating : undefined,
          sortBy: filters.sortBy || undefined,
        };
        // Remove undefined values
        Object.keys(params).forEach((key) => {
          if (params[key] === undefined || params[key] === '') delete params[key];
        });

        console.log('📦 Fetch params:', params);
        const publicRes = await courseApi.getPublicCourses(params);
        console.log('📦 Response:', publicRes.data);

        const publicCourses = publicRes.data?.data || [];
        const meta = publicRes.data?.meta || { totalPages: 1 };
        setTotalPages(meta.totalPages || 1);
        setCurrentPage(page);

        // Check enrolled courses
        let myCourseIds = new Set<string>();
        try {
          const myRes = await studentApi.getMyCourses();
          const myCourses = myRes.data?.data || myRes.data || [];
          myCourseIds = new Set(myCourses.map((c: any) => c.id));
        } catch {
          // Not logged in or no courses
        }

        const merged = publicCourses.map((c: any) => ({
          ...c,
          isEnrolled: myCourseIds.has(c.id),
        }));

        setCourses(merged);
      } catch (err: any) {
        console.error('Lỗi fetch courses:', err);
        setError(err.message || 'Không thể tải danh sách khóa học');
        toast.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      filters.category,
      filters.level,
      filters.minPrice,
      filters.maxPrice,
      filters.minRating,
      filters.sortBy,
    ]
  );

  // Fetch khi filter thay đổi (debounced)
  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Nếu thay đổi các filter khác, reset về trang 1 (thực hiện ở useEffect trên)
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setFilters((prev) => ({ ...prev, minPrice: values[0], maxPrice: values[1] }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      minPrice: 0,
      maxPrice: 10000000,
      minRating: 0,
      sortBy: 'popular',
    });
    setPriceRange([0, 10000000]);
    setCurrentPage(1);
  };

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await studentApi.enrollCourse(courseId);
      toast.success('Đăng ký thành công!');
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c)));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setEnrolling(null);
    }
  };

  const handleAddToCart = async (courseId: string) => {
    setAddingToCart(courseId);
    try {
      await studentApi.addToCart(courseId);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    } finally {
      setAddingToCart(null);
    }
  };

  const goToLearning = (courseId: string) => {
    router.push(`/lx/${courseId}`);
  };

  // Render course card (giữ nguyên)
  const renderCourseCard = (course: Course) => {
    const hasDiscount = course.originalPrice && course.originalPrice > course.price;
    const discountPercent = hasDiscount
      ? Math.round((1 - course.price / course.originalPrice!) * 100)
      : 0;

    const getLevelLabel = (level: string) => {
      switch (level) {
        case 'beginner':
          return 'Cơ bản';
        case 'intermediate':
          return 'Trung cấp';
        case 'advanced':
          return 'Nâng cao';
        default:
          return level || 'Tất cả';
      }
    };

    return (
      <Card
        key={course.id}
        className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
      >
        <div className="relative">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
              <span className="text-sm">Không có ảnh</span>
            </div>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              -{discountPercent}%
            </Badge>
          )}
          {course.level && (
            <Badge variant="outline" className="absolute bottom-2 left-2 bg-white/80 backdrop-blur">
              {getLevelLabel(course.level)}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <Link href={`/courses/${course.id}`} className="block hover:underline">
            <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.shortDescription || course.description || 'Chưa có mô tả'}
          </p>

          {course.instructor && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={course.instructor.avatarUrl} />
                <AvatarFallback>{course.instructor.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{course.instructor.fullName}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating?.toFixed(1) || 'Chưa có'}</span>
              <span className="text-muted-foreground">
                ({course.students?.toLocaleString() || 0})
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.students?.toLocaleString() || 0}</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-xs line-through text-muted-foreground">
                    {course.originalPrice?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ) : (
                <span className="font-bold">{course.price.toLocaleString('vi-VN')}đ</span>
              )}
            </div>
            <div>
              {course.isEnrolled ? (
                <Button size="sm" onClick={() => goToLearning(course.id)}>
                  Vào học
                </Button>
              ) : course.price === 0 ? (
                <Button size="sm" onClick={() => handleEnroll(course.id)}>
                  {enrolling === course.id ? <Spinner className="h-4 w-4" /> : 'Đăng ký'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddToCart(course.id)}
                  disabled={addingToCart === course.id}
                >
                  {addingToCart === course.id ? <Spinner className="h-4 w-4" /> : 'Thêm vào giỏ'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // FilterSidebar (giữ nguyên)
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Danh mục</h3>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">Tất cả</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Cấp độ</h3>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.level}
          onChange={(e) => handleFilterChange('level', e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="beginner">Cơ bản</option>
          <option value="intermediate">Trung cấp</option>
          <option value="advanced">Nâng cao</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Mức giá</h3>
        <div className="px-2">
          <Slider
            value={[priceRange[0], priceRange[1]]}
            min={0}
            max={10000000}
            step={100000}
            onValueChange={handlePriceRangeChange}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
            <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Đánh giá</h3>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.minRating}
          onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
        >
          <option value="0">Tất cả</option>
          <option value="1">1 sao trở lên</option>
          <option value="2">2 sao trở lên</option>
          <option value="3">3 sao trở lên</option>
          <option value="4">4 sao trở lên</option>
          <option value="5">5 sao</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Sắp xếp</h3>
        <select
          className="w-full p-2 border rounded-md"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="popular">Phổ biến</option>
          <option value="newest">Mới nhất</option>
          <option value="trending">Xu hướng</option>
        </select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 mr-1" /> Xóa bộ lọc
      </Button>
    </div>
  );

  // Loading & error states
  if (loading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
        <p className="mt-4 text-sm text-gray-500">Đang tải danh sách khóa học...</p>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchCourses(currentPage)} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Khám phá khóa học</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm khóa học..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <Card className="p-4 sm:hidden">
          <FilterSidebar />
        </Card>
      )}

      {/* Desktop layout */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="hidden sm:block w-64 shrink-0">
          <Card className="p-4 sticky top-24">
            <FilterSidebar />
          </Card>
        </div>

        {/* Course grid */}
        <div className="flex-1">
          {loading && courses.length > 0 ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500">Không tìm thấy khóa học nào phù hợp với bộ lọc.</p>
              <p className="text-sm text-gray-400 mt-1">Hãy thử thay đổi bộ lọc hoặc tìm kiếm.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map(renderCourseCard)}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchCourses(page)}
                    isLoading={loading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
