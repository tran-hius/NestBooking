export const getBookingFailTemplate = (bookingCode: string, reason: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #f44336;">Hủy Đặt Phòng</h2>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào,</p>
      <p style="font-size: 16px; color: #333;">Rất tiếc phải thông báo rằng yêu cầu đặt phòng của bạn (Mã: <strong>${bookingCode}</strong>) đã bị hủy.</p>
      <div style="background-color: #fff3f3; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
        <p style="margin: 5px 0; font-size: 16px; color: #d32f2f;"><strong>Lý do:</strong> ${reason}</p>
      </div>
      <p style="font-size: 16px; color: #333;">Nếu bạn đã thanh toán, chúng tôi sẽ tiến hành hoàn tiền vào tài khoản của bạn trong vòng 3-5 ngày làm việc.</p>
      <p style="font-size: 16px; color: #333;">Xin chân thành xin lỗi vì sự bất tiện này. Bạn có thể quay lại ứng dụng để tìm kiếm các phòng khác phù hợp hơn.</p>
      <br />
      <p style="font-size: 14px; color: #777;">Trân trọng,<br/>Đội ngũ NestBooking</p>
    </div>
  `;
};
