// src/__tests__/auth/registerUser.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerUser } from '../../services/auth.service.js' 
import { prisma } from '../../lib/prisma.js'                 
import bcrypt from 'bcryptjs'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}))

const mockTx = {
  user: {
    create: vi.fn(),
  },
  fillingStation: {
    findUnique: vi.fn(),
  },
  region: {
    findUnique: vi.fn(),
  },
  fillingStationManager: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  regionalDistributionManager: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}

const setupTransaction = () => {
  vi.mocked(prisma.$transaction).mockImplementation((cb: any) => cb(mockTx))
}

const baseInput = {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'plainpassword',
  name: 'John Doe',
  role: 'STAFF',
}

const mockCreatedUser = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  name: 'John Doe',
  role: 'STAFF',
}


describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()

    // default — no manager relations
    mockTx.fillingStationManager.findFirst.mockResolvedValue(null)
    mockTx.regionalDistributionManager.findUnique.mockResolvedValue(null)
  })

  // Password hashing 
  describe('password hashing', () => {
    it('should hash the password before saving', async () => {
      mockTx.user.create.mockResolvedValue(mockCreatedUser)

      await registerUser(baseInput)

      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10)
      expect(mockTx.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: 'hashed_password' }),
        })
      )
    })
  })

  // STAFF role 
  describe('STAFF role', () => {
    it('should create a user and return without stationId or regionId', async () => {
      mockTx.user.create.mockResolvedValue(mockCreatedUser)

      const result = await registerUser(baseInput)

      expect(result).toEqual({
        ...mockCreatedUser,
        stationId: null,
        regionId: null,
      })
    })

    it('should not create any manager records for STAFF role', async () => {
      mockTx.user.create.mockResolvedValue(mockCreatedUser)

      await registerUser(baseInput)

      expect(mockTx.fillingStationManager.create).not.toHaveBeenCalled()
      expect(mockTx.regionalDistributionManager.create).not.toHaveBeenCalled()
    })

    it('should save null for optional name if not provided', async () => {
      const { name, ...inputWithoutName } = baseInput
      mockTx.user.create.mockResolvedValue({ ...mockCreatedUser, name: null })

      await registerUser(inputWithoutName)

      expect(mockTx.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: null }),
        })
      )
    })
  })

  // MANAGER role — station 
  describe('MANAGER role with stationId', () => {
    const managerInput = { ...baseInput, role: 'MANAGER', stationId: 10 }
    const managerUser = { ...mockCreatedUser, role: 'MANAGER' }

    it('should create a FillingStationManager record', async () => {
      mockTx.user.create.mockResolvedValue(managerUser)
      mockTx.fillingStation.findUnique.mockResolvedValue({ id: 10, name: 'Station A' })
      mockTx.fillingStationManager.findFirst.mockResolvedValue({ stationId: 10 })

      const result = await registerUser(managerInput)

      expect(mockTx.fillingStationManager.create).toHaveBeenCalledWith({
        data: { userId: managerUser.id, stationId: 10 },
      })
      expect(result.stationId).toBe(10)
    })

    it('should throw if filling station does not exist', async () => {
      mockTx.user.create.mockResolvedValue(managerUser)
      mockTx.fillingStation.findUnique.mockResolvedValue(null) // not found

      await expect(registerUser(managerInput)).rejects.toThrow('Filling station not found')
    })
  })

  // MANAGER role — region
  describe('MANAGER role with regionId', () => {
    const managerInput = { ...baseInput, role: 'MANAGER', regionId: 5 }
    const managerUser = { ...mockCreatedUser, role: 'MANAGER' }

    it('should create a RegionalDistributionManager record', async () => {
      mockTx.user.create.mockResolvedValue(managerUser)
      mockTx.region.findUnique.mockResolvedValue({ id: 5, name: 'Region A' })
      mockTx.regionalDistributionManager.findUnique.mockResolvedValue({ regionId: 5 })

      const result = await registerUser(managerInput)

      expect(mockTx.regionalDistributionManager.create).toHaveBeenCalledWith({
        data: { userId: managerUser.id, regionId: 5 },
      })
      expect(result.regionId).toBe(5)
    })

    it('should throw if region does not exist', async () => {
      mockTx.user.create.mockResolvedValue(managerUser)
      mockTx.region.findUnique.mockResolvedValue(null) // not found

      await expect(registerUser(managerInput)).rejects.toThrow('Region not found')
    })
  })

  // MANAGER role — both station and region 
  describe('MANAGER role with both stationId and regionId', () => {
    it('should create both manager records and return both ids', async () => {
      const managerInput = { ...baseInput, role: 'MANAGER', stationId: 10, regionId: 5 }
      const managerUser = { ...mockCreatedUser, role: 'MANAGER' }

      mockTx.user.create.mockResolvedValue(managerUser)
      mockTx.fillingStation.findUnique.mockResolvedValue({ id: 10 })
      mockTx.region.findUnique.mockResolvedValue({ id: 5 })
      mockTx.fillingStationManager.findFirst.mockResolvedValue({ stationId: 10 })
      mockTx.regionalDistributionManager.findUnique.mockResolvedValue({ regionId: 5 })

      const result = await registerUser(managerInput)

      expect(mockTx.fillingStationManager.create).toHaveBeenCalled()
      expect(mockTx.regionalDistributionManager.create).toHaveBeenCalled()
      expect(result.stationId).toBe(10)
      expect(result.regionId).toBe(5)
    })
  })

  // Unique constraint errors ─
  describe('unique constraint errors', () => {
    it('should throw "Username already in use" on duplicate username', async () => {
      mockTx.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['username'] },
      })

      await expect(registerUser(baseInput)).rejects.toThrow('Username already in use')
    })

    it('should throw "Email already in use" on duplicate email', async () => {
      mockTx.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      })

      await expect(registerUser(baseInput)).rejects.toThrow('Email already in use')
    })

    it('should throw "Unique field already in use" for other P2002 errors', async () => {
      mockTx.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['someOtherField'] },
      })

      await expect(registerUser(baseInput)).rejects.toThrow('Unique field already in use')
    })
  })

  // Generic errors 
  describe('generic errors', () => {
    it('should rethrow unexpected errors', async () => {
      mockTx.user.create.mockRejectedValue(new Error('Database connection failed'))

      await expect(registerUser(baseInput)).rejects.toThrow('Database connection failed')
    })
  })
})