# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Chỉ copy package.json và thư mục prisma trước để cài đặt thư viện
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Sinh ra Prisma Client Engine
RUN npx prisma generate

# Copy mã nguồn và build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]