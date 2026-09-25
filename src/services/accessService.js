import { roleService } from './roleService'
import { userService } from './userService'
import { validateAccessMatrix, extractRole } from '@/lib/accessMatrix'
import {
  getUserId,
  getUserRoleId,
  getUserRoleName,
  toRoleOptions,
} from '@/lib/accessControl'

async function resolveRole(user) {
  let source = user
  let roleId = getUserRoleId(source)
  let roleName = getUserRoleName(source)

  // Login payloads differ between API versions. If roleId is absent, use the
  // authenticated user's detail record before falling back to an exact role
  // name match.
  if (!roleId) {
    const userId = getUserId(user)
    if (userId != null) {
      try {
        source = await userService.getById(userId)
        roleId = getUserRoleId(source)
        roleName = getUserRoleName(source) ?? roleName
      } catch {
        // Continue to exact role-name resolution below.
      }
    }
  }

  if (!roleId && roleName) {
    const options = toRoleOptions(await roleService.getAll())
    const matches = options.filter((role) => role.label.toLowerCase() === roleName.toLowerCase())
    if (matches.length > 1) throw new Error('Your role assignment is ambiguous. Please contact an administrator.')
    roleId = matches[0]?.id ?? null
    roleName = matches[0]?.label ?? roleName
  }

  if (!roleId) throw new Error('Your account does not have a valid role assignment.')
  return { roleId, roleName }
}

export const accessService = {
  async getCurrentUserAccess(user) {
    const { roleId, roleName } = await resolveRole(user)

    // Always load the current server matrix before granting runtime access.
    // Display caches must never preserve a permission that has been revoked.
    const matrix = await roleService.getAccessMatrix(roleId, { allowCache: false })
    const permissions = validateAccessMatrix(matrix)
    if (!permissions) throw new Error('Your role access matrix is unavailable or invalid.')

    return {
      roleId,
      roleName: extractRole(matrix)?.role ?? roleName,
      permissions,
    }
  },
}
