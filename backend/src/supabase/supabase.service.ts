import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseAnonKey = this.configService.get<string>('supabase.publishableKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.warn(
        'Supabase credentials are not fully configured. Supabase client is not initialized.',
      );
      return;
    }

    try {
      this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.logger.log('Supabase client successfully initialized.');
    } catch (error) {
      this.logger.error(`Failed to initialize Supabase client: ${error.message}`);
    }
  }

  /**
   * Verifies a Supabase bearer access token and returns the user object.
   * @param token Bearer access token from the request
   */
  async getUserByToken(token: string): Promise<User> {
    if (!this.supabaseClient) {
      this.logger.error('Attempted to verify token, but Supabase client is not initialized.');
      throw new UnauthorizedException('Authentication service is currently unavailable.');
    }

    const { data, error } = await this.supabaseClient.auth.getUser(token);

    if (error || !data.user) {
      this.logger.debug(`Token verification failed: ${error?.message || 'User not found'}`);
      throw new UnauthorizedException(error?.message || 'Invalid or expired token.');
    }

    return data.user;
  }
}
