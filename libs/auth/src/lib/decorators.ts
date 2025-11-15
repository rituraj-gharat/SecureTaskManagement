import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Permission } from '@secure-tasks/data';

export const REQ_PERMS = 'required_permissions';
export const RequirePerms = (...perms: Permission[]) => SetMetadata(REQ_PERMS, perms);

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as { userId: string; orgId: string; roles: string[] };
});
