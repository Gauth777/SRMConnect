import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum ProjectPostTypeInput {
  PROJECT = 'project',
  HACKATHON = 'hackathon',
  RESEARCH = 'research',
  INHOUSE = 'inhouse',
  GUEST_LECTURE = 'guest-lecture',
  WORKSHOP = 'workshop',
}

export enum ProjectModeInput {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  HYBRID = 'Hybrid',
}

export enum SkillLevelInput {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  ANY_LEVEL = 'Any Level',
}

export enum ProjectStatusInput {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
}

export class CreateProjectDto {
  @IsEnum(ProjectPostTypeInput)
  postType!: ProjectPostTypeInput;

  @IsString()
  @MaxLength(100)
  title!: string;

  @IsString()
  domain!: string;

  @IsString()
  @MinLength(50)
  @MaxLength(500)
  description!: string;

  @IsEnum(ProjectModeInput)
  mode!: ProjectModeInput;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsEnum(SkillLevelInput)
  skillLevel!: SkillLevelInput;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  slots!: number;

  @IsString()
  duration!: string;

  @IsDateString()
  deadline!: string;

  @IsOptional()
  @IsString()
  additionalRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredDocs?: string[];

  @IsOptional()
  @IsEnum(ProjectStatusInput)
  status?: ProjectStatusInput;
}
