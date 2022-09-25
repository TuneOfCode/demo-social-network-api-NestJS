import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((data) => ({
        isSucess: true,
        statusCode: HttpStatus.OK,
        statusCodeMessage: HttpStatus[HttpStatus.OK],
        data: data,
        path: request.url,
        time: new Date().toLocaleDateString('es-US'),
      })),
    );
  }
}
