import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

let permissions: string[] = [];

// API Key permissions
registerPermission("airlink.api.keys.view");
registerPermission("airlink.api.keys.create");
registerPermission("airlink.api.keys.delete");
registerPermission("airlink.api.keys.edit");

// API endpoints permissions
registerPermission("airlink.api.servers.read");
registerPermission("airlink.api.servers.create");
registerPermission("airlink.api.servers.update");
registerPermission("airlink.api.servers.delete");
registerPermission("airlink.api.users.read");
registerPermission("airlink.api.users.create");
registerPermission("airlink.api.users.update");
registerPermission("airlink.api.users.delete");
registerPermission("airlink.api.nodes.read");
registerPermission("airlink.api.nodes.create");
registerPermission("airlink.api.nodes.update");
registerPermission("airlink.api.nodes.delete");
registerPermission("airlink.api.settings.read");
registerPermission("airlink.api.settings.update");

function registerPermission(permission: string): void {
  if (!permissions.includes(permission)) {
    permissions.push(permission);
  }
}

const checkPermission = async ( requiredPermission: string) =>
async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.user?.id;

  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return false;
  }

  let userPermissions: string[] = [];
  try {
    userPermissions = JSON.parse(user.permissions || '[]');
  } catch (e) {
    return false;
  }

  return userPermissions.some((perm: string) => {
    if (perm === requiredPermission) return true;
    if (perm.endsWith('.*')) {
      const base = perm.slice(0, -2);
      return requiredPermission.startsWith(`${base}.`);
    }
    return false;
  });
};

export { registerPermission, checkPermission };
export default permissions;