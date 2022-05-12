import { Request } from 'express'
import { stringify } from 'qs'
import { PageOutOfBoundsError } from '@/api/errors'
import config from '@/config'

/**
 * Generate pagination links based on request query parameters
 *
 * @param req Request
 * @param totalCount Total number of resources
 * @returns Pagination links
 */
export function getPaginationLinks(req: Request, totalCount: number) {
  const hostUrl = config.app.url

  // Original url with out query params
  const route = req.originalUrl.split('?')[0]

  const generatePageUrl = (pageNum: number): string => {
    const stringifiedQueryParams = stringify({
      ...req.query,
      page: pageNum,
    })

    return `${hostUrl}${route}?${stringifiedQueryParams}`
  }

  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10

  const totalPagesCount = Math.ceil(totalCount / limit) || 1

  const lastPage = totalPagesCount
  const currentPage = page
  const nextPage = currentPage + 1
  const prevPage = currentPage - 1

  // Throw error ff requested page larger than pages count
  if (currentPage > totalPagesCount) throw new PageOutOfBoundsError()

  return {
    first: generatePageUrl(1),
    last: generatePageUrl(lastPage),
    next: nextPage > lastPage ? null : generatePageUrl(nextPage),
    prev: prevPage <= 0 ? null : generatePageUrl(prevPage),
  }
}

export * from './QueryOptionsBuilder'
