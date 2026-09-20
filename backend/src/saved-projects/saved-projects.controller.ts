import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { SavedProjectsService } from './saved-projects.service';

@ApiTags('saved-projects')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('saved-projects')
export class SavedProjectsController {
  constructor(private readonly savedProjectsService: SavedProjectsService) {}

  @Get('me')
  listMine(@Req() req: AuthenticatedRequest) {
    return this.savedProjectsService.listMine(req.user.id);
  }

  @Post(':projectId')
  save(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.savedProjectsService.save(req.user.id, projectId);
  }

  @Delete(':projectId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.savedProjectsService.remove(req.user.id, projectId);
  }
}
