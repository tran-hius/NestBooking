import { PrismaClient } from './generated/prisma/index.js';
import { TokenService } from './src/modules/auth/services/tokenService.js';
import { Role } from './generated/prisma/index.js';

async function testKYC() {
  const prisma = new PrismaClient();
  const tokenService = new TokenService();

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('Không có user nào trong DB');
    return;
  }

  const token = tokenService.generateAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  console.log(Đang test gửi KYC cho User ID: );
  
  const response = await fetch(http://localhost:3000/api/users//kyc/submit, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': Bearer 
    },
    body: JSON.stringify({
      documentType: 'CCCD',
      idNumber: '079200123456',
      idCardImageUrl: 'https://example.com/cccd.jpg'
    })
  });

  const data = await response.json();
  console.log('Kết quả gửi KYC:');
  console.log(JSON.stringify(data, null, 2));

  if (data.success) {
      console.log('Thử duyệt KYC bằng quyền ADMIN...');
      const adminToken = tokenService.generateAccessToken({
          userId: user.id,
          role: Role.ADMIN,
          email: 'admin@test.com'
      });

      const approveRes = await fetch(http://localhost:3000/api/users//kyc/approve, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': Bearer 
          }
      });
      const approveData = await approveRes.json();
      console.log('Kết quả Duyệt KYC:');
      console.log(JSON.stringify(approveData, null, 2));
  }
}

testKYC().catch(console.error);
