import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { env } from 'src/configs/common.config';
import { LoginUserDto } from '../dto/auth.dto';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'email',
      passwordField: 'password',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SIGNATURE,
    });
  }

  async validate(loginUserDto: LoginUserDto) {
    return { email: loginUserDto.email };
  }
}
