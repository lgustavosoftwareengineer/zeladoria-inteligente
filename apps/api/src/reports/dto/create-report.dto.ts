import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'Short title describing the problem',
    example: 'Buraco na calçada',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the problem reported by the citizen',
    example:
      'Tem um buraco enorme na calçada na frente do número 42, impossível passar com carrinho de bebê.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    description: 'Location of the problem (street, neighborhood, city)',
    example: 'Rua das Flores, 42, Centro, São Paulo - SP, 01310-100',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  location!: string;
}
