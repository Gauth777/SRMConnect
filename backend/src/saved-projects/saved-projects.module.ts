import { Module } from '@nestjs/common';
import { SavedProjectsController } from './saved-projects.controller';
import { SavedProjectsService } from './saved-projects.service';

@Module({
  controllers: [SavedProjectsController],
  providers: [SavedProjectsService],
})
export class SavedProjectsModule {}
