import { Controller, Post, UseGuards, Request, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const { username, password } = body;
    if (!username || !password) {
      throw new UnauthorizedException('Username and password are required');
    }
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.authService.login(user);
  }

  @Post('change-password')
  async changePassword(@Body() body: any, @Request() req: any) {
    const { newPassword, tempToken } = body;
    
    // We can accept the tempToken in body or read from Bearer auth
    let userId: string | null = null;
    
    if (tempToken) {
      try {
        const payload = this.jwtService.verify(tempToken);
        if (payload.mustChangePassword) {
          userId = payload.sub;
        }
      } catch (err) {
        throw new UnauthorizedException('Invalid or expired temporary password token');
      }
    } else {
      // Fallback: if they are already logged in, check authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const payload = this.jwtService.verify(token, { ignoreExpiration: true });
          userId = payload.sub;
        } catch (err) {
          throw new UnauthorizedException('Invalid authorization token');
        }
      }
    }

    if (!userId) {
      throw new UnauthorizedException('Unauthorized to change password');
    }

    return this.authService.changePassword(userId, newPassword);
  }
}
