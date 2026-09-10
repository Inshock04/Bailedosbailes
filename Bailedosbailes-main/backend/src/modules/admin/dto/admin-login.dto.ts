import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido de administrador' })
  email?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(5, { message: 'A senha deve ter no mínimo 5 caracteres' })
  password: string;
}
