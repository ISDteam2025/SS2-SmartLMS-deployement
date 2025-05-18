import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Ensure user object and role exists
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User must be authenticated');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.includes(user.role as UserRole);
    
    if (!hasRole) {
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }
    
    return true;
  }
} 