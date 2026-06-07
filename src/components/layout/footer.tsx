// components/layout/footer.tsx

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Logo & mô tả */}
          <div className="col-span-1">
            <h2 className="text-xl font-bold text-gray-900"> FutureNext.ai </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nền tảng đào tạo công nghệ với AI hàng đầu Việt Nam
            </p>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Về chúng tôi
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-base text-gray-600 hover:text-gray-900">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-base text-gray-600 hover:text-gray-900">
                  Đội ngũ
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-600 hover:text-gray-900">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Hỗ trợ</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-base text-gray-600 hover:text-gray-900">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-600 hover:text-gray-900">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-600 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Pháp lý */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Pháp lý
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/terms" className="text-base text-gray-600 hover:text-gray-900">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-600 hover:text-gray-900">
                  Bảo mật
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-base text-gray-600 hover:text-gray-900">
                  Cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-base text-gray-400 text-center">
            © 2026 FutureNext.ai . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
