import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { formatString, isString } from 'src/helpers/common.helper';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const responseException = exception.getResponse();
    let message = responseException;
    if (responseException instanceof Object) {
      message = Object(responseException)?.message;
      message = isString(message) ? message : message[0];
    }

    response.status(statusCode).json({
      isSucess: false,
      statusCode: statusCode,
      message: message || formatString(HttpStatus[statusCode]),
      path: request.url,
      time: new Date().toLocaleString('es-Us'),
    });
  }
}
