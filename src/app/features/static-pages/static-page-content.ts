export interface StaticPageSection {
  heading: string;
  body: string[];
}

export interface StaticPageContent {
  title: string;
  sections: StaticPageSection[];
}

/** Keyed by route `data['page']` — see `app.routes.ts`. Placeholder policy copy; swap in real legal text before this ever goes to production. */
export const STATIC_PAGE_CONTENT: Record<string, StaticPageContent> = {
  terms: {
    title: 'Điều khoản dịch vụ',
    sections: [
      {
        heading: '1. Chấp nhận điều khoản',
        body: [
          'Khi truy cập và sử dụng zipmart, bạn đồng ý tuân thủ các điều khoản dịch vụ được nêu tại đây cùng mọi quy định pháp luật hiện hành.',
        ],
      },
      {
        heading: '2. Tài khoản người dùng',
        body: [
          'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.',
          'zipmart có quyền tạm khoá tài khoản nếu phát hiện dấu hiệu gian lận hoặc vi phạm điều khoản.',
        ],
      },
      {
        heading: '3. Đặt hàng & thanh toán',
        body: [
          'Đơn hàng chỉ được xác nhận sau khi hệ thống kiểm tra tồn kho và thông tin thanh toán hợp lệ.',
          'Giá hiển thị đã bao gồm thuế VAT theo quy định, chưa bao gồm phí vận chuyển (nếu có).',
        ],
      },
      {
        heading: '4. Thay đổi điều khoản',
        body: ['zipmart có thể cập nhật điều khoản này theo thời gian; phiên bản mới nhất luôn được đăng tại trang này.'],
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    sections: [
      {
        heading: '1. Thông tin thu thập',
        body: [
          'zipmart thu thập thông tin bạn cung cấp khi đăng ký tài khoản, đặt hàng hoặc liên hệ hỗ trợ: họ tên, email, số điện thoại, địa chỉ giao hàng.',
        ],
      },
      {
        heading: '2. Mục đích sử dụng',
        body: [
          'Thông tin được dùng để xử lý đơn hàng, chăm sóc khách hàng, và cải thiện trải nghiệm mua sắm (gợi ý sản phẩm phù hợp).',
          'zipmart không bán hoặc cho thuê dữ liệu cá nhân của bạn cho bên thứ ba.',
        ],
      },
      {
        heading: '3. Bảo mật dữ liệu',
        body: ['Mật khẩu được mã hoá, không lưu trữ dưới dạng văn bản thuần trong hệ thống.'],
      },
      {
        heading: '4. Quyền của bạn',
        body: ['Bạn có thể yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân bất kỳ lúc nào qua trang Hồ sơ hoặc liên hệ hỗ trợ.'],
      },
    ],
  },
  'return-policy': {
    title: 'Chính sách đổi trả',
    sections: [
      {
        heading: 'Điều kiện đổi trả',
        body: [
          'Sản phẩm được đổi trả trong vòng 30 ngày kể từ ngày nhận hàng, còn nguyên tem mác, chưa qua sử dụng.',
          'Một số mặt hàng (thực phẩm, đồ lót, sản phẩm đã kích hoạt bảo hành điện tử) không áp dụng đổi trả vì lý do vệ sinh/kỹ thuật.',
        ],
      },
      {
        heading: 'Quy trình đổi trả',
        body: [
          '1. Vào Đơn hàng của tôi, chọn đơn cần đổi trả và gửi yêu cầu.',
          '2. zipmart xác nhận yêu cầu trong vòng 24 giờ làm việc.',
          '3. Đóng gói sản phẩm và bàn giao cho đơn vị vận chuyển được chỉ định.',
          '4. Hoàn tiền hoặc đổi sản phẩm mới sau khi hàng trả được kiểm tra đạt yêu cầu.',
        ],
      },
      {
        heading: 'Thời gian hoàn tiền',
        body: ['3-7 ngày làm việc kể từ khi zipmart nhận và xác nhận hàng trả hợp lệ.'],
      },
    ],
  },
  'shipping-guide': {
    title: 'Hướng dẫn thanh toán & vận chuyển',
    sections: [
      {
        heading: 'Phương thức thanh toán',
        body: [
          'Thanh toán khi nhận hàng (COD): áp dụng cho hầu hết khu vực nội thành.',
          'Thanh toán trước (CREDIT): trừ tiền ngay khi đặt hàng thành công.',
        ],
      },
      {
        heading: 'Thời gian giao hàng',
        body: [
          'Nội thành: 1-2 ngày làm việc.',
          'Ngoại thành/tỉnh khác: 3-5 ngày làm việc.',
        ],
      },
      {
        heading: 'Phí vận chuyển',
        body: ['Miễn phí vận chuyển cho đơn hàng từ 500.000₫ trở lên; đơn nhỏ hơn áp dụng phí tiêu chuẩn theo khu vực.'],
      },
    ],
  },
};
