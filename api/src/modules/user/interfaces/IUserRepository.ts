import { User, Prisma, UserStatus } from "../../../../generated/prisma";

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmailOrPhone(email: string, phoneNumber?: string): Promise<User | null>;
  getUserWithPasswordByEmail(email: string): Promise<User | null>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  incrementLoginAttempts(id: string): Promise<void>;
  resetLoginAttempts(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
  updateStatus(id: string, status: UserStatus): Promise<User>;
}
