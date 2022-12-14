import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { PassportModule } from '@nestjs/passport/dist';
import { env } from 'src/configs/common.config';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    FilesModule,
    PassportModule,
    JwtModule.register({
      secret: env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: env.JWT_ACCESS_TOKEN_EXPIES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
