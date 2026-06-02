import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
    // Can validate by username or email
    let user = await this.usersService.findByUsername(usernameOrEmail);
    if (!user) {
      user = await this.usersService.findByEmail(usernameOrEmail);
    }

    if (user && user.isActive) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    // If password change is required, force them to change it (e.g. return a special token/status)
    if (user.isPasswordChangeRequired) {
      return {
        status: 'PASSWORD_CHANGE_REQUIRED',
        message: 'You must change your password on first login.',
        tempToken: this.jwtService.sign(
          { sub: user.id, username: user.username, role: user.role, mustChangePassword: true },
          { expiresIn: '15m' },
        ),
      };
    }

    const payload = { sub: user.id, username: user.username, role: user.role, storeId: user.storeId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
    };
  }

  async changePassword(userId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.isPasswordChangeRequired = false;

    await this.usersService.save(user);

    // Return active token
    const payload = { sub: user.id, username: user.username, role: user.role, storeId: user.storeId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
    };
  }
}
