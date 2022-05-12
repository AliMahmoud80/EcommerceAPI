import { NextFunction, Request, Response } from 'express'
import {
  APIError,
  NotFoundError,
  ValidationError,
  BadRequest,
} from '@/api/errors'
import { instanceToPlain } from 'class-transformer'
import {
  DatabaseError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} from 'sequelize'
import { IResponse } from '@/interfaces'
import { ValidationError as classValidatorError } from 'class-validator'
import { MulterError } from 'multer'

/**
 * Application API error handler.
 * This middleware handles the throwing of errors from various components and handles them.
 * If it isn't A supported error type to be handled,
 * it will return general API error {@link APIError} by default.
 *
 * @param error error to be handled
 * @param req Request
 * @param res Response
 * @param next: NextFunction
 */
export function ErrorHandler(
  error: APIError | classValidatorError | DatabaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errorResponse: IResponse = { errors: [] }
  let status = 500

  if (error instanceof SyntaxError) {
    errorResponse.errors?.push(new BadRequest())
  } else if (error instanceof APIError) {
    errorResponse.errors?.push(error)
    status = parseInt(error.status)
  } else if (
    error instanceof DatabaseError ||
    error instanceof UniqueConstraintError
  ) {
    const validationErrors = databaseErrorToValidationError(error)

    errorResponse.errors?.push(validationErrors)
    status = 422
  } else if (Array.isArray(error) && error[0] instanceof classValidatorError) {
    const validationErrors = classValidatorErrorToValidationErrors(error)

    errorResponse.errors?.push(...validationErrors)
    status = 422
  } else if (error instanceof MulterError) {
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      errorResponse.errors?.push(
        new ValidationError({
          meta: {
            value: error.field,
          },
          detail: 'Invalid field name',
        })
      )
    } else {
      errorResponse.errors?.push(
        new ValidationError({ detail: 'Error while uploading your file' })
      )
    }
  } else {
    const generalAPIError: APIError = new APIError()

    errorResponse.errors?.push(generalAPIError)
  }

  // Convert array of errors objects to plain json
  errorResponse.errors = instanceToPlain(errorResponse.errors) as any[]

  res.status(status).json(errorResponse)

  next()
}

/**
 * Catches requests for non existing resources and,
 * respond with NotFoundError {@link NotFoundError}
 *
 * @param req Request
 * @param res Response
 */
export function NotFoundHandler(req: Request, res: Response) {
  const error = instanceToPlain(new NotFoundError())
  const status = parseInt(error.status) || 404

  return res.status(status).json({ errors: [error] })
}

/**
 * Utility function to convert Database errors {@link DatabaseError}
 * to API ValidationError.
 *
 * @param error Database error
 * @returns {ValidationError} API ValidationError
 */
function databaseErrorToValidationError(
  error: DatabaseError | ForeignKeyConstraintError | UniqueConstraintError
): ValidationError {
  if (error instanceof ForeignKeyConstraintError) {
    let errorDetail = ''
    if (error.fields) {
      errorDetail = `refrenced ${error.fields[0]} doesn't exist`
    } else {
      errorDetail = 'refrence error'
    }
    return new ValidationError({
      detail: errorDetail,
      source: {
        // @ts-ignore
        attribute: error.fields[0] || undefined,
        value: error.value || null,
      },
    })
  } else if (error instanceof UniqueConstraintError) {
    return new ValidationError({
      detail: error.errors[0].message,
      source: {
        attribute: error.errors[0].path || undefined,
        value: error.errors[0].value,
      },
    })
  }

  return new ValidationError()
}

/**
 * Utility function to convert validation errors thrown by class-validator
 * to the standart API ValidationError {@link ValidationError}
 *
 * @param errors Validation errors thrown by class-validator
 * @returns {ValidationError[]} Array of API ValidationError
 */
function classValidatorErrorToValidationErrors(
  errors: classValidatorError[]
): ValidationError[] {
  const validationErrors: ValidationError[] = []

  errors.forEach((error) => {
    if (error.children && error.children?.length > 0) {
      validationErrors.push(
        ...classValidatorErrorToValidationErrors(error.children)
      )
    }
    if (error.constraints && typeof error.constraints === 'object') {
      Object.keys(error.constraints).forEach((key) => {
        validationErrors.push(
          new ValidationError({
            // @ts-ignore
            detail: error.constraints[key],
            source: {
              attribute: error.property,
              value: error.value || null,
            },
          })
        )
      })
    }
  })

  return validationErrors
}
