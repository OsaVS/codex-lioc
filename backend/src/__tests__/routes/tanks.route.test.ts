import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import tanksRouter from '../../routes/tanks.js'
import { tankHistory, createManualMeasurement } from '../../services/tanks.service.js'
import { requireAuth, requireManagerOrAdmin } from '../../middleware/authMiddleware.js'

vi.mock('../../services/tanks.service', () => ({
  tankHistory: vi.fn(),
  createManualMeasurement: vi.fn(),
}))

vi.mock('../../middleware/authMiddleware', () => ({
  requireAuth: vi.fn((req, res, next) => next()),
  requireManagerOrAdmin: vi.fn((req, res, next) => next()),
}))

const app = express()
app.use(express.json())
app.use('/tanks', tanksRouter)

describe('Tanks Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => next()) as any)
    vi.mocked(requireManagerOrAdmin).mockImplementation(((req: any, res: any, next: any) => next()) as any)
  })

  describe('GET /tanks/:tankId/history', () => {
    it('should return 200 with history', async () => {
      vi.mocked(tankHistory).mockResolvedValue([
        { measuredTime: '2026-06-06T08:00:00.000Z', level: 1200, type: 'SENSOR' }
      ])

      const res = await request(app).get('/tanks/1/history')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([
        { measuredTime: '2026-06-06T08:00:00.000Z', level: 1200, type: 'SENSOR' }
      ])
      expect(tankHistory).toHaveBeenCalledWith(1, 7)
    })
  })

  describe('POST /tanks/:tankId/measurements/manual', () => {
    it('should return 200 and success response on valid body', async () => {
      vi.mocked(createManualMeasurement).mockResolvedValue({
        success: true,
        calculatedVolume: 2500,
      })

      const res = await request(app)
        .post('/tanks/1/measurements/manual')
        .send({
          measuredTime: '2026-06-06T08:00:00.000Z',
          measurement: 200,
          userId: 3,
        })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        success: true,
        calculatedVolume: 2500,
      })
      expect(createManualMeasurement).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        200,
        3
      )
    })

    it('should return 400 validation error if body fields are missing', async () => {
      const res = await request(app)
        .post('/tanks/1/measurements/manual')
        .send({
          measurement: 200,
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('VALIDATION_ERROR')
    })

    it('should return 404 if tank or user is not found', async () => {
      vi.mocked(createManualMeasurement).mockRejectedValue(new Error('Tank not found'))

      const res = await request(app)
        .post('/tanks/999/measurements/manual')
        .send({
          measuredTime: '2026-06-06T08:00:00.000Z',
          measurement: 200,
          userId: 3,
        })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Tank not found')
    })

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Not authenticated' })
      }) as any)

      const res = await request(app)
        .post('/tanks/1/measurements/manual')
        .send({
          measuredTime: '2026-06-06T08:00:00.000Z',
          measurement: 200,
          userId: 3,
        })

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Not authenticated')
    })

    it('should return 403 if user is not an admin or manager', async () => {
      vi.mocked(requireManagerOrAdmin).mockImplementation(((req: any, res: any, next: any) => {
        res.status(403).json({ error: 'Forbidden' })
      }) as any)

      const res = await request(app)
        .post('/tanks/1/measurements/manual')
        .send({
          measuredTime: '2026-06-06T08:00:00.000Z',
          measurement: 200,
          userId: 3,
        })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Forbidden')
    })
  })
})
