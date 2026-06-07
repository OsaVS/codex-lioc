import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import { Role } from '@prisma/client'
import authRouter from '../../routes/auth.js'           // adjust path
import { registerUser, authenticateUser } from '../../services/auth.service.js'
import { signSession, COOKIE_NAME } from '../../lib/auth.js'
import { requireAuth } from '../../middleware/authMiddleware.js'

vi.mock('../../services/auth.service', () => ({
  registerUser: vi.fn(),
  authenticateUser: vi.fn(),
}))

vi.mock('../../lib/auth', () => ({
  signSession: vi.fn().mockResolvedValue('mock_token'),
  COOKIE_NAME: 'session',
  cookieOptions: vi.fn().mockReturnValue({ httpOnly: true }),
}))

vi.mock('../../middleware/authMiddleware', () => ({
  requireAuth: vi.fn((req, res, next) => next()), // pass through by default
}))


const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/auth', authRouter)

const mockUser = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  name: 'John Doe',
  role: Role.STAFF,
  stationId: null,
  regionId: null,
}

const validRegisterBody = {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'Password123!',
  role: 'STAFF',
}

const validLoginBody = {
  usernameOrEmail: 'johndoe',
  password: 'Password123!',
}

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // reset requireAuth to pass through
    vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => {
      next()
    }) as any)
  })

  // POST /auth/register 
  describe('POST /auth/register', () => {

    describe('success', () => {
      it('should return 200 with user and set cookie on valid input', async () => {
        vi.mocked(registerUser).mockResolvedValue(mockUser)

        const res = await request(app)
          .post('/auth/register')
          .send(validRegisterBody)

        expect(res.status).toBe(200)
        expect(res.body.user).toMatchObject({
          username: 'johndoe',
          email: 'john@example.com',
        })
        expect(res.headers['set-cookie']).toBeDefined()
      })

      it('should call signSession with correct payload', async () => {
        vi.mocked(registerUser).mockResolvedValue(mockUser)

        await request(app).post('/auth/register').send(validRegisterBody)

        expect(signSession).toHaveBeenCalledWith({
          userId: mockUser.id,
          username: mockUser.username,
          role: mockUser.role,
        })
      })

      it('should set the correct cookie name', async () => {
        vi.mocked(registerUser).mockResolvedValue(mockUser)

        const res = await request(app).post('/auth/register').send(validRegisterBody)

        const cookies = res.headers['set-cookie'] as unknown as string[]
        expect(cookies.some((c: string) => c.startsWith(COOKIE_NAME))).toBe(true)
      })
    })

    describe('validation errors (400)', () => {
      it('should return 400 with VALIDATION_ERROR if email is invalid', async () => {
        const res = await request(app)
          .post('/auth/register')
          .send({ ...validRegisterBody, email: 'not-an-email' })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('VALIDATION_ERROR')
        expect(res.body.details).toBeDefined()
      })

      it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
          .post('/auth/register')
          .send({ email: 'john@example.com' }) 

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('VALIDATION_ERROR')
      })

      it('should return 400 if password is too weak (if schema enforces it)', async () => {
        const res = await request(app)
          .post('/auth/register')
          .send({ ...validRegisterBody, password: '123' })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('VALIDATION_ERROR')
      })
    })

    describe('conflict errors (409)', () => {
      it('should return 409 if username already in use', async () => {
        vi.mocked(registerUser).mockRejectedValue(new Error('Username already in use'))

        const res = await request(app).post('/auth/register').send(validRegisterBody)

        expect(res.status).toBe(409)
        expect(res.body.error).toBe('CONFLICT')
        expect(res.body.message).toBe('Username already in use')
      })

      it('should return 409 if email already in use', async () => {
        vi.mocked(registerUser).mockRejectedValue(new Error('Email already in use'))

        const res = await request(app).post('/auth/register').send(validRegisterBody)

        expect(res.status).toBe(409)
        expect(res.body.error).toBe('CONFLICT')
        expect(res.body.message).toBe('Email already in use')
      })
    })

    describe('not found errors (404)', () => {
      it('should return 404 if filling station not found', async () => {
        vi.mocked(registerUser).mockRejectedValue(new Error('Filling station not found'))

        const res = await request(app)
          .post('/auth/register')
          .send({ ...validRegisterBody, role: 'MANAGER', stationId: 99 })

        expect(res.status).toBe(404)
        expect(res.body.error).toBe('FILLING_STATION_NOT_FOUND')
      })

      it('should return 404 if region not found', async () => {
        vi.mocked(registerUser).mockRejectedValue(new Error('Region not found'))

        const res = await request(app)
          .post('/auth/register')
          .send({ ...validRegisterBody, role: 'MANAGER', regionId: 99 })

        expect(res.status).toBe(404)
        expect(res.body.error).toBe('REGION_NOT_FOUND')
      })
    })

    describe('server errors (500)', () => {
      it('should return 500 on unexpected error', async () => {
        vi.mocked(registerUser).mockRejectedValue(new Error('Database connection failed'))

        const res = await request(app).post('/auth/register').send(validRegisterBody)

        expect(res.status).toBe(500)
        expect(res.body.error).toBe('INTERNAL_SERVER_ERROR')
      })
    })
  })

  // POST /auth/login 
  describe('POST /auth/login', () => {

    describe('success', () => {
      it('should return 200 with user and set cookie on valid credentials', async () => {
        vi.mocked(authenticateUser).mockResolvedValue(mockUser)

        const res = await request(app).post('/auth/login').send(validLoginBody)

        expect(res.status).toBe(200)
        expect(res.body.user).toMatchObject({ username: 'johndoe' })
        expect(res.headers['set-cookie']).toBeDefined()
      })

      it('should call authenticateUser with correct args', async () => {
        vi.mocked(authenticateUser).mockResolvedValue(mockUser)

        await request(app).post('/auth/login').send(validLoginBody)

        expect(authenticateUser).toHaveBeenCalledWith('johndoe', 'Password123!')
      })

      it('should call signSession with correct payload', async () => {
        vi.mocked(authenticateUser).mockResolvedValue(mockUser)

        await request(app).post('/auth/login').send(validLoginBody)

        expect(signSession).toHaveBeenCalledWith({
          userId: mockUser.id,
          username: mockUser.username,
          role: mockUser.role,
        })
      })
    })

    describe('auth errors (401)', () => {
      it('should return 401 if authenticateUser returns null', async () => {
        vi.mocked(authenticateUser).mockResolvedValue(null)

        const res = await request(app).post('/auth/login').send(validLoginBody)

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid credentials')
      })
    })

    describe('validation errors (400)', () => {
      it('should return 400 if body is missing usernameOrEmail', async () => {
        const res = await request(app)
          .post('/auth/login')
          .send({ password: 'Password123!' })

        expect(res.status).toBe(400)
      })

      it('should return 400 if body is missing password', async () => {
        const res = await request(app)
          .post('/auth/login')
          .send({ usernameOrEmail: 'johndoe' })

        expect(res.status).toBe(400)
      })
    })

    describe('server errors', () => {
      it('should return 400 with error message on unexpected error', async () => {
        vi.mocked(authenticateUser).mockRejectedValue(new Error('Unexpected failure'))

        const res = await request(app).post('/auth/login').send(validLoginBody)

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Unexpected failure')
      })
    })
  })

  // POST /auth/logout 
  describe('POST /auth/logout', () => {
    it('should return 200 with ok: true', async () => {
      const res = await request(app).post('/auth/logout')

      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
    })

    it('should clear the session cookie', async () => {
      const res = await request(app).post('/auth/logout')

      const cookies = res.headers['set-cookie'] as unknown as string[]
      expect(cookies.some((c: string) => c.includes(`${COOKIE_NAME}=;`))).toBe(true)
    })
  })

  // GET /auth/me 
  describe('GET /auth/me', () => {
    it('should return user from req.user when authenticated', async () => {
      // simulate requireAuth attaching user to req
      vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => {
        req.user = mockUser
        next()
      }) as any)

      const res = await request(app).get('/auth/me')

      expect(res.status).toBe(200)
      expect(res.body.user).toMatchObject({ username: 'johndoe' })
    })

    it('should return 401 if requireAuth blocks the request', async () => {
      // simulate requireAuth rejecting unauthenticated request
      vi.mocked(requireAuth).mockImplementation(((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' })
      }) as any)

      const res = await request(app).get('/auth/me')

      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Unauthorized')
    })
  })
})