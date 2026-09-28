import { Component, signal } from '@angular/core';

interface FaqEntry {
  question: string;
  answer: string;
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'Làm sao để theo dõi đơn hàng của tôi?',
    answer: 'Vào mục "Đơn hàng của tôi" trong Hồ sơ để xem trạng thái và lịch sử từng đơn.',
  },
  {
    question: 'zipmart hỗ trợ những phương thức thanh toán nào?',
    answer:
      'Hiện tại zipmart hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán trước (CREDIT). Xem chi tiết tại trang Hướng dẫn thanh toán & vận chuyển.',
  },
  {
    question: 'Tôi có thể đổi trả sản phẩm không?',
    answer: 'Có, trong vòng 30 ngày kể từ ngày nhận hàng với sản phẩm còn nguyên tem mác. Xem Chính sách đổi trả để biết chi tiết.',
  },
  {
    question: 'Làm sao để áp dụng mã giảm giá?',
    answer: 'Nhập mã giảm giá ở bước thanh toán (checkout), trước khi xác nhận đặt hàng.',
  },
  {
    question: 'Tôi quên mật khẩu, phải làm sao?',
    answer: 'Tại trang đăng nhập, chọn "Quên mật khẩu" và làm theo hướng dẫn được gửi qua email.',
  },
  {
    question: 'Làm sao để liên hệ hỗ trợ?',
    answer: 'Gửi email tới hotro@zipmart.vn hoặc gọi hotline 1900 6868 (8:00 - 21:00 hằng ngày).',
  },
];

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.html',
})
export class FaqPage {
  readonly entries = FAQ_ENTRIES;
  readonly openIndex = signal<number | null>(null);

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
