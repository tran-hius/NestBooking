import { User, Prisma, UserStatus } from "../../../../generated/prisma";

export interface IUserRepository {
  findAll(): Promise<User[]>;

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByEmailOrPhone(email: string, phoneNumber?: string): Promise<User | null>

  create(data: Prisma.UserCreateInput): Promise<User>;

  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;

  incrementLoginAttempts(id: string): Promise<void>;

  resetLoginAttempts(id: string): Promise<void>;

  updatePassword(id: string, passwordHash: string): Promise<User>;

  updateStatus(id: string, status: UserStatus): Promise<User>;
}