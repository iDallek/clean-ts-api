import bcrypt from 'bcrypt'
import { BcryptAdapter } from './bcrypt-adapter'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise(resolve => resolve('hash'))
  }
}))

const salt = 12

const makeSUT = (): BcryptAdapter => {
  return new BcryptAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  test('Should call bcrypt with correct values', async () => {
    const SUT = makeSUT()
    const hashSpy = jest.spyOn(bcrypt, 'hash')

    await SUT.encrypt('any_value')
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  test('Should throw if bcrypt throws', async () => {
    const SUT = makeSUT()
    jest.spyOn(bcrypt, 'hash').mockReturnValueOnce(
      // @ts-expect-error: Unreachable code error
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = SUT.encrypt('any_value')
    await expect(promise).rejects.toThrow()
  })

  test('Should return a hash on success', async () => {
    const SUT = makeSUT()

    const hash = await SUT.encrypt('any_value')
    expect(hash).toBe('hash')
  })
})
