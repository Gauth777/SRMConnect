import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  ApplicationDecisionInput,
  UpdateApplicationStatusDto,
} from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(studentId: string, projectId: string, dto: CreateApplicationDto) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new ForbiddenException('A student profile is required to apply.');
    }

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');
    if (project.status !== ProjectStatus.OPEN) {
      throw new BadRequestException('This project is not accepting applications.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (project.deadline < today) {
      throw new BadRequestException('The application deadline has passed.');
    }

    const existing = await this.prisma.application.findUnique({
      where: { projectId_studentId: { projectId, studentId } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this project.');
    }

    return this.prisma.application.create({
      data: {
        projectId,
        studentId,
        coverLetter: dto.coverLetter,
        githubUrl: dto.githubUrl,
        portfolioUrl: dto.portfolioUrl,
        documentUrls: dto.documentUrls ?? {},
      },
      include: { project: true },
    });
  }

  async listMine(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new ForbiddenException('A student profile is required for this operation.');
    }

    return this.prisma.application.findMany({
      where: { studentId },
      include: {
        project: { include: { faculty: { include: { profile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForProject(facultyId: string, projectId: string) {
    await this.requireOwnedProject(facultyId, projectId);
    return this.prisma.application.findMany({
      where: { projectId },
      include: { student: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    facultyId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { project: true },
    });
    if (!application) throw new NotFoundException('Application not found.');
    if (application.project.facultyId !== facultyId) {
      throw new ForbiddenException('You do not own this project.');
    }

    const status =
      dto.status === ApplicationDecisionInput.ACCEPTED
        ? ApplicationStatus.ACCEPTED
        : ApplicationStatus.REJECTED;

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  async withdraw(studentId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found.');
    if (application.studentId !== studentId) {
      throw new ForbiddenException('You do not own this application.');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
    });
  }

  private async requireOwnedProject(facultyId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');
    if (project.facultyId !== facultyId) {
      throw new ForbiddenException('You do not own this project.');
    }
    return project;
  }
}
