import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, Length, Max, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString({ message: 'ticketTierId deve ser uma string identificadora do lote' })
  @IsNotEmpty({ message: 'O tipo de ingresso (ticketTierId) é obrigatório' })
  ticketTierId: string;

  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero' })
  @Min(1, { message: 'Mínimo de 1 ingresso por pedido' })
  @Max(10, { message: 'Máximo de 10 ingressos por pedido' })
  quantity: number;

  @IsString({ message: 'Nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome do titular é obrigatório' })
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres' })
  buyerName: string;

  @IsEmail({}, { message: 'Informe um e-mail válido para recebimento do ingresso' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  buyerEmail: string;

  @IsString({ message: 'Telefone deve ser um texto válido' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @Length(10, 20, { message: 'O telefone deve conter DDD e número válido' })
  buyerPhone: string;
}
