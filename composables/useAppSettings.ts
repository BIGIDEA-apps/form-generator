import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export interface AppSettings {
  defaultPrimaryLogo: string
  defaultPrimaryLogoSvgToWhite: boolean
  spreadsheetTemplateId: string
  spreadsheetTemplateName: string
  spreadsheetTemplateUrl: string
  columnMapping: Record<string, string>
}

export function useAppSettingsQuery() {
  return useQuery<AppSettings>({
    queryKey: ['appSettings'],
    queryFn: () => $fetch<AppSettings>('/api/settings'),
  })
}

export function useUpdateAppSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<AppSettings>) =>
      $fetch<AppSettings>('/api/settings', { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] })
    },
  })
}
