import { ref, isRef, type Ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { FormConfig } from '~/types/form'

export function useFormsListQuery() {
  return useQuery<FormConfig[]>({
    queryKey: ['forms'],
    queryFn: () => $fetch('/api/forms'),
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

export function useDuplicateFormMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      $fetch<FormConfig>(`/api/forms/${id}/duplicate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
    },
  })
}
