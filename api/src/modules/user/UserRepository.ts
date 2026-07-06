import {
  Prisma,
  User,
  UserStatus,
  PrismaClient,
} from "../../../generated/prisma";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByEmailOrPhone(email: string, phoneNumber?: string): Promise<User | null>{
    if(!phoneNumber){
      return this.prisma.user.findUnique({
        where: {email},
      })
    }
    return this.prisma.user.findFirst({
      where: {
        OR: [
          {email: email},
          {
            profile: {
              phoneNumber: phoneNumber,
            }
          }
        ]
      },
      include: {profile: true}
    })
  };


  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        login_attempts: {
          increment: 1,
        },
      },
    });
  }

  async resetLoginAttempts(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        login_attempts: 0,
        lock_until: null,
      },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        password_hash: passwordHash,
        updated_at: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }
}
