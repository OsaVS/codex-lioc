import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import pumpsRouter from '../../routes/pumps.js'
import { addPumpReading } from '../../services/pumps.service.js'
import { requireAuth, requireManagerOrAdmin } from '../../middleware/authMiddleware.js'

vi.mock('../../services/pumps.service', () => ({
  addPumpReading: vi.fn(),
}))

vi.mock('../../middleware/authMiddleware', () => ({
  requireAuth: vi.fn((req, res, next) => next()),
  requireManagerOrAdmin: vi.fn((req, res, next) => next()),
}))

const app = express()
app.use(express.json())
app.use('/pumps', pumpsRouter)

describe('Pumps Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => next()) as any)
    vi.mocked(requireManagerOrAdmin).mockImplementation(((req: any, res: any, next: any) => next()) as any)
  })

  describe('POST /pumps/:pumpId/readings', () => {
    it('should return 200 and success response on valid body', async () => {
      vi.mocked(addPumpReading).mockResolvedValue({
        success: true,
      })

      const res = await request(app)
        .post('/pumps/1/readings')
        .send({
          timestamp: '2026-06-06T08:00:00.000Z',
          readingValue: 123.45,
        })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        success: true,
      })
      expect(addPumpReading).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        123.45
      )
    })

    it('should return 400 validation error if body fields are missing', async () => {
      const res = await request(app)
        .post('/pumps/1/readings')
        .send({
          timestamp: '2026-06-06T08:00:00.000Z',
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('VALIDATION_ERROR')
    })

    it('should return 404 if pump is not found', async () => {
      vi.mocked(addPumpReading).mockRejectedValue(new Error('Pump not found'))

      const res = await request(app)
        .post('/pumps/999/readings')
        .send({
          timestamp: '2026-06-06T08:00:00.000Z',
          readingValue: 123.45,
        })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Pump not found')
    })

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Not authenticated' })
      }) as any)

      const res = await request(app)
        .post('/pumps/1/readings')
        .send({
          timestamp: '2026-06-06T08:00:00.000Z',
          readingValue: 123.45,
        })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Not authenticated')
    })

    it('should return 403 if user is not an admin or manager', async () => {
      vi.mocked(requireManagerOrAdmin).mockImplementation(((req: any, res: any, next: any) => {
        res.status(403).json({ error: 'Forbidden' })
      }) as any)

      const res = await request(app)
        .post('/pumps/1/readings')
        .send({
          timestamp: '2026-06-06T08:00:00.000Z',
          readingValue: 123.45,
        })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Forbidden')
    })
  })
})
