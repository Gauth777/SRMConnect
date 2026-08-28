import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('me')
  listMine(@Req() req: AuthenticatedRequest) {
    return this.applicationsService.listMine(req.user.id);
  }

  @Get('projects/:projectId')
  listForProject(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.applicationsService.listForProject(req.user.id, projectId);
  }

  @Post('projects/:projectId')
  apply(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(req.user.id, projectId, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(req.user.id, id, dto);
  }

  @Patch(':id/withdraw')
  withdraw(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.applicationsService.withdraw(req.user.id, id);
  }
}
