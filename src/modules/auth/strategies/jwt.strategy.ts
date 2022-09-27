import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { env } from 'src/configs/common.config';
import { LoginUserDto } from '../dto/auth.dto';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const extactFromCookie = (request: Request) => {
      return request?.cookies[env.JWT_COOKIE]?.accessToken || null;
    };
    super({
      usernameField: 'email',
      passwordField: 'password',
      ignoreExpiration: false,
      secretOrKey: env.JWT_SIGNATURE,
      jwtFromRequest: ExtractJwt.fromExtractors([
        extactFromCookie,
        // ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }

  async validate(loginUserDto: LoginUserDto) {
    return { email: loginUserDto.email };
  }
}
