export function useFormBaseUrl() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.formBaseUrl as string
  return {
    formBaseUrl: baseUrl,
    formUrl: (slug: string) => (baseUrl ? `${baseUrl}/forms/${slug}` : `/forms/${slug}`),
  }
}
