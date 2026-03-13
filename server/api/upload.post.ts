import { getCloudinary } from '~/server/utils/cloudinary'

const ALLOWED_TYPES = ['image/png', 'image/svg+xml', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const file = formData[0]

  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
    })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File too large. Maximum size is 5MB',
    })
  }

  const base64 = `data:${file.type};base64,${file.data.toString('base64')}`
  const config = useRuntimeConfig()
  const folder = config.cloudinaryFolder || 'Form-Generator-Logos'

  try {
    const cloudinary = getCloudinary()
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'image',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  }
  catch (err) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Image upload failed. Please try again later.',
    })
  }
})
