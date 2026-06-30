import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../../supabase/supabase.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let supabaseService: jest.Mocked<SupabaseService>;

  beforeEach(async () => {
    const mockSupabaseService = {
      getUserByToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseAuthGuard,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    guard = module.get<SupabaseAuthGuard>(SupabaseAuthGuard);
    supabaseService = module.get(SupabaseService);
  });

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
      user: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const context = createMockExecutionContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Missing Authorization header.'),
    );
  });

  it('should throw UnauthorizedException if header is not Bearer', async () => {
    const context = createMockExecutionContext('Basic dGVzdDp0ZXN0');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization header must follow "Bearer <token>" format.'),
    );
  });

  it('should throw UnauthorizedException if token is missing after Bearer', async () => {
    const context = createMockExecutionContext('Bearer ');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization header must follow "Bearer <token>" format.'),
    );
  });

  it('should verify the token and attach the user to request on success', async () => {
    const mockUser = { id: 'test-uuid', email: 'test@srmist.edu.in' };
    supabaseService.getUserByToken.mockResolvedValue(mockUser as any);

    const context = createMockExecutionContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(supabaseService.getUserByToken).toHaveBeenCalledWith('valid-token');
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockUser);
  });

  it('should propagate UnauthorizedException if token verification fails', async () => {
    supabaseService.getUserByToken.mockRejectedValue(
      new UnauthorizedException('Invalid or expired token.'),
    );

    const context = createMockExecutionContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token.'),
    );
  });
});
