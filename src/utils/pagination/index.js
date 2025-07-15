const InvariantError = require('../../exceptions/InvariantError')

const validateAndCalculatePagination = (page = 1, limit = 10) => {
  page = parseInt(page)
  limit = parseInt(limit)

  if (page < 1 || limit < 1) {
    throw new InvariantError('Invalid page or limit', 400)
  }

  const offset = (page - 1) * limit
  return { page, limit, offset }
}

const createPaginationResponse = (h, data, page = 1, limit = 10) => {
  page = parseInt(page)
  limit = parseInt(limit)

  const total = data.total || 0
  const results = data.results || []
  const totalPages = Math.ceil(total / limit)
  const hasPreviousPage = page > 1
  const hasNextPage = page < totalPages

  return h.response({
    status: 'success',
    data: {
      [data.resourceName || 'results']: results,
      _pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage,
        hasNextPage,
        previousPage: hasPreviousPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null
      }
    }
  })
}

module.exports = { createPaginationResponse, validateAndCalculatePagination }
