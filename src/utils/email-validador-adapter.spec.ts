import { EmailValidatorAdapter } from './email-validator'

describe('EmailValidator Adapter', () => {
  test('Should return false if validator return false', () => {
    const SUT = new EmailValidatorAdapter()
    const isValid = SUT.isValid('invalid_email@mail.com')
    expect(isValid).toBe(false)
  })
})
