import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../services/users.service';

@ValidatorConstraint({ name: 'IsEmailAlreadyExist', async: true })
@Injectable()
export class IsEmailAlreadyExistContraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersService: UsersService) {}
  async validate(
    email: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    console.log('email: ', email);
    if (!email) return false;
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) return true;
      console.log('>>> user: ', user);
    } catch (error) {
      console.log('error: ', error);
    }
    return false;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Email '${validationArguments.value}' already exist`;
  }
}

export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailAlreadyExistContraint,
    });
  };
}
