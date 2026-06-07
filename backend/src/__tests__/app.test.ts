import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'

describe('app root', () => {
  it('GET / returns 200 and hello message', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Hello from Express')
  })
})
