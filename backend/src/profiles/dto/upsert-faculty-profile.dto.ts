import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum FacultyAdvisorRoleInput {
  FA = 'FA',
  AA = 'AA',
  BOTH = 'BOTH',
  NEITHER = 'NEITHER',
}

export class UpsertFacultyProfileDto {
  @IsString()
  fullName!: string;

  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEnum(FacultyAdvisorRoleInput)
  advisorRole?: FacultyAdvisorRoleInput;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  campus?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domains?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentSubjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previousSubjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
