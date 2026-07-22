import { TxClient } from "@/config/prisma";
import { User, Prisma, UserStatus } from "../../../../generated/prisma";

export interface IUserRepository {
  create(data: Prisma.UserCreateInput, tx?: TxClient): Promise<User>;

  findById(id: string, tx?: TxClient): Promise<User | null>;

  findAll(tx?: TxClient): Promise<User[]>;

  findByEmail(email: string, tx?: TxClient): Promise<User | null>;

  findByPhone(phone: string, tx?: TxClient): Promise<User | null>;

  findByEmailOrPhone(
    email: string,
    phoneNumber?: string,
    tx?: TxClient,
  ): Promise<User | null>;

  getUserWithPasswordByEmail(
    email: string,
    tx?: TxClient,
  ): Promise<User | null>;

  update(
    id: string,
    data: Prisma.UserUpdateInput,
    tx?: TxClient,
  ): Promise<User>;

  delete(id: string, tx?: TxClient): Promise<void>;

  restore(id: string, tx?: TxClient): Promise<void>;

  incrementLoginAttempts(id: string, tx?: TxClient): Promise<void>;

  resetLoginAttempts(id: string, tx?: TxClient): Promise<void>;

  updatePassword(
    id: string,
    passwordHash: string,
    tx?: TxClient,
  ): Promise<User>;

  updateStatus(id: string, status: UserStatus, tx?: TxClient): Promise<User>;
}
