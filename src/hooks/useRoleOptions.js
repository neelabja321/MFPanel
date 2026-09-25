import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { roleService } from '@/services/roleService'
import { toRoleOptions } from '@/lib/accessControl'

export function useRoleOptions() {
  const query = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  })

  const roles = useMemo(() => toRoleOptions(query.data), [query.data])
  return { ...query, roles }
}
