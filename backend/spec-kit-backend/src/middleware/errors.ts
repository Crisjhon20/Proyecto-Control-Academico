import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { AppError } from '../utils/errors.js'

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof AppError) {
    return c.json({
      success: false,
      error: { code: error.code, message: error.message },
    }, error.status as ContentfulStatusCode)
  }

  console.error(error)
  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error interno' },
  }, 500)
}
