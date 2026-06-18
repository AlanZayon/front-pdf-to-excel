import { describe, expect, it } from 'vitest'
import { parseApiError } from '../shared/utils/http'
import axios from 'axios'

describe('parseApiError', () => {
  it('returns backend message from axios error', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: {} as never },
        data: { message: 'Arquivo inválido' },
      }
    )

    expect(parseApiError(error, 'fallback')).toBe('Arquivo inválido')
  })

  it('returns fallback for unknown errors', () => {
    expect(parseApiError({}, 'fallback')).toBe('fallback')
  })
})
