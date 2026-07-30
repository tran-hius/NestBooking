export const getBookingSuccessTemplate = (bookingCode, checkInDate, checkOutDate) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4CAF50;">🎉 Đặt Phòng Thành Công!</h2>
      </div>
      <p style="font-size: 16px; color: #333;">Xin chào,</p>
      <p style="font-size: 16px; color: #333;">Chúc mừng bạn đã đặt phòng thành công trên hệ thống <strong>NestBooking</strong>.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0; font-size: 16px;"><strong>Mã đơn đặt phòng:</strong> <span style="color: #0056b3;">${bookingCode}</span></p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Ngày nhận phòng:</strong> ${checkInDate}</p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Ngày trả phòng:</strong> ${checkOutDate}</p>
      </div>
      <p style="font-size: 16px; color: #333;">Vui lòng lưu lại mã đơn này để cung cấp cho lễ tân khi làm thủ tục nhận phòng.</p>
      <br />
      <p style="font-size: 14px; color: #777;">Trân trọng,<br/>Đội ngũ NestBooking</p>
    </div>
  `;
};
