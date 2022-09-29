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
import { formatString } from 'src/helpers/common.helper';

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
    const statusCode = request.url.match(/register|create|new|insert/g)
      ? HttpStatus.CREATED
      : HttpStatus.OK;
    return next.handle().pipe(
      map((data) => ({
        isSucess: true,
        statusCode: statusCode,
        message: formatString(HttpStatus[statusCode]),
        data: data,
        path: request.url,
        time: new Date().toLocaleString('es-Us'),
      })),
    );
  }
}
