import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { env } from 'src/configs/common.config';
import { decoded } from 'src/helpers/common.helper';
import { LoginUserDto } from '../dto/auth.dto';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const extactFromCookie = (request: Request) => {
      const authCookie = decoded(request.cookies[env.JWT_COOKIE]);
      return authCookie?.accessToken || null;
    };
    super({
      usernameField: 'email',
      passwordField: 'password',
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([
        extactFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }

  async validate(loginUserDto: LoginUserDto) {
    return { email: loginUserDto.email };
  }
}
