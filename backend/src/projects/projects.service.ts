import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ProjectMode,
  ProjectPostType,
  ProjectStatus,
  SkillLevel,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  CreateProjectDto,
  ProjectModeInput,
  ProjectPostTypeInput,
  ProjectStatusInput,
  SkillLevelInput,
} from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const POST_TYPE_MAP: Record<ProjectPostTypeInput, ProjectPostType> = {
  [ProjectPostTypeInput.PROJECT]: ProjectPostType.PROJECT,
  [ProjectPostTypeInput.HACKATHON]: ProjectPostType.HACKATHON,
  [ProjectPostTypeInput.RESEARCH]: ProjectPostType.RESEARCH,
  [ProjectPostTypeInput.INHOUSE]: ProjectPostType.INHOUSE,
  [ProjectPostTypeInput.GUEST_LECTURE]: ProjectPostType.GUEST_LECTURE,
  [ProjectPostTypeInput.WORKSHOP]: ProjectPostType.WORKSHOP,
};

const MODE_MAP: Record<ProjectModeInput, ProjectMode> = {
  [ProjectModeInput.ONLINE]: ProjectMode.ONLINE,
  [ProjectModeInput.OFFLINE]: ProjectMode.OFFLINE,
  [ProjectModeInput.HYBRID]: ProjectMode.HYBRID,
};

const SKILL_LEVEL_MAP: Record<SkillLevelInput, SkillLevel> = {
  [SkillLevelInput.BEGINNER]: SkillLevel.BEGINNER,
  [SkillLevelInput.INTERMEDIATE]: SkillLevel.INTERMEDIATE,
  [SkillLevelInput.ADVANCED]: SkillLevel.ADVANCED,
  [SkillLevelInput.ANY_LEVEL]: SkillLevel.ANY_LEVEL,
};

const STATUS_MAP: Record<ProjectStatusInput, ProjectStatus> = {
  [ProjectStatusInput.DRAFT]: ProjectStatus.DRAFT,
  [ProjectStatusInput.OPEN]: ProjectStatus.OPEN,
  [ProjectStatusInput.CLOSED]: ProjectStatus.CLOSED,
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  listOpen() {
    return this.prisma.project.findMany({
      where: { status: ProjectStatus.OPEN },
      include: {
        faculty: { include: { profile: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        faculty: { include: { profile: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  async listMine(facultyId: string) {
    await this.requireFaculty(facultyId);
    return this.prisma.project.findMany({
      where: { facultyId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(facultyId: string, dto: CreateProjectDto) {
    await this.requireFaculty(facultyId);
    this.assertDeadline(dto.deadline);

    return this.prisma.project.create({
      data: {
        facultyId,
        postType: POST_TYPE_MAP[dto.postType],
        title: dto.title.trim(),
        domain: dto.domain,
        description: dto.description.trim(),
        mode: MODE_MAP[dto.mode],
        skills: dto.skills,
        skillLevel: SKILL_LEVEL_MAP[dto.skillLevel],
        slots: dto.slots,
        duration: dto.duration,
        deadline: new Date(dto.deadline),
        additionalRequirements: dto.additionalRequirements,
        requiredDocs: dto.requiredDocs?.length ? dto.requiredDocs : ['resume'],
        status: dto.status ? STATUS_MAP[dto.status] : ProjectStatus.OPEN,
      },
      include: { faculty: { include: { profile: true } } },
    });
  }

  async update(facultyId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.requireOwnedProject(facultyId, id);
    if (dto.deadline) this.assertDeadline(dto.deadline);

    const data: Prisma.ProjectUpdateInput = {};
    if (dto.postType !== undefined) data.postType = POST_TYPE_MAP[dto.postType];
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.domain !== undefined) data.domain = dto.domain;
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.mode !== undefined) data.mode = MODE_MAP[dto.mode];
    if (dto.skills !== undefined) data.skills = dto.skills;
    if (dto.skillLevel !== undefined) data.skillLevel = SKILL_LEVEL_MAP[dto.skillLevel];
    if (dto.slots !== undefined) data.slots = dto.slots;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.deadline !== undefined) data.deadline = new Date(dto.deadline);
    if (dto.additionalRequirements !== undefined) {
      data.additionalRequirements = dto.additionalRequirements;
    }
    if (dto.requiredDocs !== undefined) data.requiredDocs = dto.requiredDocs;
    if (dto.status !== undefined) data.status = STATUS_MAP[dto.status];

    return this.prisma.project.update({ where: { id: project.id }, data });
  }

  async archive(facultyId: string, id: string) {
    await this.requireOwnedProject(facultyId, id);
    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.ARCHIVED },
    });
  }

  private async requireFaculty(id: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) {
      throw new ForbiddenException('A faculty profile is required for this operation.');
    }
    return faculty;
  }

  private async requireOwnedProject(facultyId: string, id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found.');
    if (project.facultyId !== facultyId) {
      throw new ForbiddenException('You do not own this project.');
    }
    return project;
  }

  private assertDeadline(value: string) {
    const deadline = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(deadline.getTime()) || deadline < today) {
      throw new BadRequestException('Deadline must be today or a future date.');
    }
  }
}
