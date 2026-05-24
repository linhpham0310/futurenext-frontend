// Payload gửi lên backend
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  agreeTerms: boolean;
  role: 'student' | 'teacher'; //  thêm
}

// Response trả về
export interface RegisterResponse {
  message: string;
}
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice?: number;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  duration: string;
  lessons: number;
  lastUpdated: string;
  tags: string[];
  bestseller?: boolean;
  featured?: boolean;
}

export interface CourseFilters {
  search: string;
  category: string;
  level: string;
  priceRange: string;
  rating: string;
}
