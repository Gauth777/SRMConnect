import { IsEnum } from 'class-validator';

export enum ApplicationDecisionInput {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationDecisionInput)
  status!: ApplicationDecisionInput;
}
