import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateWaitlistDto {
  @IsString({ message: 'Nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email: string;

  @IsString({ message: 'Telefone deve ser um texto válido' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @Length(10, 20, { message: 'O telefone deve conter DDD e número válido' })
  phone: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
