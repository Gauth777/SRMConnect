import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SavedProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(studentId: string) {
    await this.requireStudent(studentId);
    return this.prisma.savedProject.findMany({
      where: { studentId },
      include: {
        project: {
          include: {
            faculty: { include: { profile: true } },
            _count: { select: { applications: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async save(studentId: string, projectId: string) {
    await this.requireStudent(studentId);

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return this.prisma.savedProject.upsert({
      where: {
        studentId_projectId: { studentId, projectId },
      },
      update: {},
      create: { studentId, projectId },
      include: {
        project: {
          include: {
            faculty: { include: { profile: true } },
            _count: { select: { applications: true } },
          },
        },
      },
    });
  }

  async remove(studentId: string, projectId: string) {
    await this.requireStudent(studentId);
    await this.prisma.savedProject.deleteMany({
      where: { studentId, projectId },
    });
    return { success: true };
  }

  private async requireStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new ForbiddenException('A student profile is required for this operation.');
    }
    return student;
  }
}
