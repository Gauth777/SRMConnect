import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UpsertFacultyProfileDto } from './dto/upsert-faculty-profile.dto';
import { UpsertStudentProfileDto } from './dto/upsert-student-profile.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.profilesService.getMe(req.user.id);
  }

  @Put('me/student')
  upsertStudent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpsertStudentProfileDto,
  ) {
    return this.profilesService.upsertStudent(req.user, dto);
  }

  @Put('me/faculty')
  upsertFaculty(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpsertFacultyProfileDto,
  ) {
    return this.profilesService.upsertFaculty(req.user, dto);
  }
}
