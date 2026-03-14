import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import type { FormConfig, FormSubmission, SpreadsheetInfo } from '~/types/form'

interface PaginatedForms {
  items: FormConfig[]
  total: number
  page: number
  limit: number
}

interface PaginatedSubmissions {
  items: FormSubmission[]
  total: number
  page: number
  limit: number
}

export function useFormsListQuery(options?: {
  page?: Ref<number>
  limit?: Ref<number>
  search?: Ref<string>
}) {
  const resolvedPage = options?.page ?? ref(1)
  const resolvedLimit = options?.limit ?? ref(15)
  const resolvedSearch = options?.search ?? ref('')

  return useQuery<PaginatedForms>({
    queryKey: ['forms', resolvedPage, resolvedLimit, resolvedSearch],
    queryFn: () => $fetch('/api/forms', {
      params: {
        page: resolvedPage.value,
        limit: resolvedLimit.value,
        search: resolvedSearch.value || undefined,
      },
    }),
  })
}

export function useFormQuery(id: Ref<string> | string) {
  const resolvedId = isRef(id) ? id : ref(id)

  return useQuery<FormConfig>({
    queryKey: ['form', resolvedId],
    queryFn: () => $fetch(`/api/forms/${resolvedId.value}`),
    enabled: () => !!resolvedId.value,
  })
}

export function usePublicFormQuery(slug: Ref<string> | string) {
  const resolvedSlug = isRef(slug) ? slug : ref(slug)

  return useQuery<FormConfig>({
    queryKey: ['publicForm', resolvedSlug],
    queryFn: () => $fetch(`/api/forms/public/${resolvedSlug.value}`),
    enabled: () => !!resolvedSlug.value,
  })
}

export function useCreateFormMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<FormConfig>) =>
      $fetch<FormConfig>('/api/forms', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
    },
  })
}

export function useUpdateFormMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormConfig> }) =>
      $fetch<FormConfig>(`/api/forms/${id}`, { method: 'PUT', body: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.invalidateQueries({ queryKey: ['form', variables.id] })
    },
  })
}

export function useDeleteFormMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      $fetch(`/api/forms/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
    },
  })
}

export function useSubmissionsQuery(formId: Ref<string> | string, options?: {
  page?: Ref<number>
  limit?: Ref<number>
  search?: Ref<string>
}) {
  const resolvedFormId = isRef(formId) ? formId : ref(formId)
  const resolvedPage = options?.page ?? ref(1)
  const resolvedLimit = options?.limit ?? ref(30)
  const resolvedSearch = options?.search ?? ref('')

  return useQuery<PaginatedSubmissions>({
    queryKey: ['submissions', resolvedFormId, resolvedPage, resolvedLimit, resolvedSearch],
    queryFn: () => $fetch('/api/submissions', {
      params: {
        formId: resolvedFormId.value,
        page: resolvedPage.value,
        limit: resolvedLimit.value,
        search: resolvedSearch.value || undefined,
      },
    }),
    enabled: () => !!resolvedFormId.value,
  })
}

export function useDuplicateFormMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, spreadsheet }: { id: string; spreadsheet?: SpreadsheetInfo }) =>
      $fetch<FormConfig>(`/api/forms/${id}/duplicate`, {
        method: 'POST',
        body: spreadsheet ? { spreadsheet } : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
    },
  })
}
