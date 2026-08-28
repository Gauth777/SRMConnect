import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsObject()
  documentUrls?: Record<string, string>;
}
