import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { RequestStatus } from '@prisma/client'
import requestsRouter from '../../routes/requests.js'
import { createRefuelRequest } from '../../services/refuelRequests.service.js'
import { requireAuth, requireManagerOrAdmin } from '../../middleware/authMiddleware.js'

vi.mock('../../services/refuelRequests.service', () => ({
  createRefuelRequest: vi.fn(),
}))

vi.mock('../../middleware/authMiddleware', () => ({
  requireAuth: vi.fn((req, res, next) => next()),
  requireManagerOrAdmin: vi.fn((req, res, next) => next()),
}))

const app = express()
app.use(express.json())
app.use('/requests', requestsRouter)

describe('Requests Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => next()) as any)
    vi.mocked(requireManagerOrAdmin).mockImplementation(((req: any, res: any, next: any) => next()) as any)
  })

  describe('POST /requests/refuel', () => {
    const validBody = {
      requestedDate: '2026-07-06T13:00:00.000Z',
      destinationStationId: 1,
      typeId: 2,
      requestedUserId: 3,
    }

    it('should return 201 and the created refuel request on success', async () => {
      const mockRequest = {
        id: 42,
        requestedDate: new Date('2026-07-06T13:00:00.000Z'),
        destinationStationId: 1,
        typeId: 2,
        requestedUserId: 3,
        status: RequestStatus.PENDING,
        decisionUserId: null,
      }
      vi.mocked(createRefuelRequest).mockResolvedValue(mockRequest)

      const res = await request(app)
        .post('/requests/refuel')
        .send(validBody)

      expect(res.status).toBe(201)
      expect(res.body).toEqual({
        id: 42,
        requestedDate: '2026-07-06T13:00:00.000Z',
        destinationStationId: 1,
        typeId: 2,
        requestedUserId: 3,
        status: 'PENDING',
        decisionUserId: null,
      })
      expect(createRefuelRequest).toHaveBeenCalledWith(
        expect.any(Date),
        1,
        2,
        3
      )
    })

    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Not authenticated' })
      }) as any)

      const res = await request(app)
        .post('/requests/refuel')
        .send(validBody)

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Not authenticated')
    })

    it('should return 400 validation error on invalid payload', async () => {
      const res = await request(app)
        .post('/requests/refuel')
        .send({
          destinationStationId: 1,
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('VALIDATION_ERROR')
    })

    it('should return 404 if station, fuel type, or user is not found', async () => {
      vi.mocked(createRefuelRequest).mockRejectedValue(new Error('Filling station not found'))

      const res = await request(app)
        .post('/requests/refuel')
        .send(validBody)

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Filling station not found')
    })

    it('should return 403 if user is not a manager or admin', async () => {
      vi.mocked(requireManagerOrAdmin).mockImplementation(((req: any, res: any, next: any) => {
        res.status(403).json({ error: 'Forbidden' })
      }) as any)

      const res = await request(app)
        .post('/requests/refuel')
        .send(validBody)

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Forbidden')
    })
  })
})
