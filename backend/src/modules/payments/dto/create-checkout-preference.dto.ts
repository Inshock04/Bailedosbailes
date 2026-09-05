import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, Length, Max, Min } from 'class-validator';

export class CreateCheckoutPreferenceDto {
  @IsString({ message: 'ticketTierId deve ser um identificador válido' })
  @IsNotEmpty({ message: 'O tipo de ingresso é obrigatório' })
  ticketTierId: string;

  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @IsPositive({ message: 'A quantidade deve ser no mínimo 1' })
  @Min(1, { message: 'Mínimo de 1 ingresso por compra' })
  @Max(10, { message: 'Máximo de 10 ingressos por transação' })
  quantity: number;

  @IsString({ message: 'Nome do titular deve ser informado' })
  @IsNotEmpty({ message: 'Nome do titular é obrigatório' })
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  buyerName: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório para envio do ingresso' })
  buyerEmail: string;

  @IsString({ message: 'Telefone com DDD é obrigatório' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Length(10, 20, { message: 'Informe um número de telefone com DDD válido' })
  buyerPhone: string;
}
