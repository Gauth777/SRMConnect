import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FacultyAdvisorRole,
  Prisma,
  UserRole,
} from '@prisma/client';
import { User } from '@supabase/supabase-js';
import { PrismaService } from '../database/prisma.service';
import { UpsertFacultyProfileDto } from './dto/upsert-faculty-profile.dto';
import { UpsertStudentProfileDto } from './dto/upsert-student-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: { student: true, faculty: true },
    });

    if (!profile) {
      throw new NotFoundException('Application profile has not been created yet.');
    }

    return profile;
  }

  async upsertStudent(user: User, dto: UpsertStudentProfileDto) {
    const email = this.requireEmail(user);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.profile.findUnique({ where: { id: user.id } });
      if (existing && existing.role !== UserRole.STUDENT) {
        throw new ForbiddenException('This account is already registered with another role.');
      }

      await tx.profile.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email,
          fullName: dto.fullName,
          role: UserRole.STUDENT,
          phoneNumber: dto.phoneNumber,
          bio: dto.bio,
          profileComplete: true,
        },
        update: {
          email,
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          bio: dto.bio,
          profileComplete: true,
        },
      });

      const studentData = {
        registrationNo: dto.registrationNo,
        dob: dto.dob ? new Date(dto.dob) : null,
        gender: dto.gender,
        department: dto.department,
        program: dto.program,
        specialization: dto.specialization,
        currentYear: dto.currentYear,
        cgpa: dto.cgpa,
        batch: dto.batch,
        skills: (dto.skills ?? []) as Prisma.InputJsonValue,
        interests: dto.interests ?? [],
        projectTypes: dto.projectTypes ?? [],
        preferredRoles: dto.preferredRoles ?? [],
        careerGoal: dto.careerGoal,
        githubUrl: dto.githubUrl,
        linkedinUrl: dto.linkedinUrl,
        portfolioUrl: dto.portfolioUrl,
        resumeUrl: dto.resumeUrl,
        otherLink: dto.otherLink,
      };

      await tx.student.upsert({
        where: { id: user.id },
        create: { id: user.id, ...studentData },
        update: studentData,
      });

      return tx.profile.findUnique({
        where: { id: user.id },
        include: { student: true, faculty: true },
      });
    });
  }

  async upsertFaculty(user: User, dto: UpsertFacultyProfileDto) {
    const email = this.requireEmail(user);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.profile.findUnique({ where: { id: user.id } });
      if (existing && existing.role !== UserRole.FACULTY) {
        throw new ForbiddenException('This account is already registered with another role.');
      }

      await tx.profile.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email,
          fullName: dto.fullName,
          role: UserRole.FACULTY,
          profileComplete: true,
        },
        update: {
          email,
          fullName: dto.fullName,
          profileComplete: true,
        },
      });

      const facultyData = {
        employeeId: dto.employeeId,
        designation: dto.designation,
        advisorRole: dto.advisorRole
          ? (dto.advisorRole as FacultyAdvisorRole)
          : null,
        experienceYears: dto.experienceYears,
        campus: dto.campus,
        department: dto.department,
        domains: dto.domains ?? [],
        currentSubjects: dto.currentSubjects ?? [],
        previousSubjects: dto.previousSubjects ?? [],
        skills: dto.skills ?? [],
      };

      await tx.faculty.upsert({
        where: { id: user.id },
        create: { id: user.id, ...facultyData },
        update: facultyData,
      });

      return tx.profile.findUnique({
        where: { id: user.id },
        include: { student: true, faculty: true },
      });
    });
  }

  private requireEmail(user: User): string {
    if (!user.email) {
      throw new BadRequestException('An institutional email is required for SRM Connect.');
    }
    return user.email;
  }
}
