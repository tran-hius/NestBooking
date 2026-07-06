FROM node:20-alpine

WORKDIR /app

# Chỉ copy package.json và thư mục prisma trước để tối ưu hóa việc cài đặt thư viện
COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies (bao gồm cả thư viện dev để chạy nodemon/ts-node-dev)
RUN npm install

# Sinh ra Prisma Client Engine để code không bị báo lỗi Type
RUN npx prisma generate

# Copy toàn bộ mã nguồn còn lại vào Container
COPY . .

# Expose port theo file .env của bạn
EXPOSE 3000

# Chạy lệnh dev của bạn (Ví dụ: "npm run dev" hoặc "npm start")
CMD ["npm", "run", "dev"]