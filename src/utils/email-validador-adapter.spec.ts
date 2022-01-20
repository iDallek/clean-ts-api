import { EmailValidatorAdapter } from './email-validator'
import validator from 'validator'

jest.mock('validator', () => ({
  isEmail (): boolean {
    return true
  }
}))

describe('EmailValidator Adapter', () => {
  test('Should return false if validator return false', () => {
    const SUT = new EmailValidatorAdapter()
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)

    const isValid = SUT.isValid('invalid_email@mail.com')
    expect(isValid).toBe(false)
  })

  test('Should return true if validator return true', () => {
    const SUT = new EmailValidatorAdapter()

    const isValid = SUT.isValid('valid_email@mail.com')
    expect(isValid).toBe(true)
  })

  test('Should call validator with correct email', () => {
    const SUT = new EmailValidatorAdapter()
    const isEmailSpy = jest.spyOn(validator, 'isEmail')

    SUT.isValid('valid_email@mail.com')
    expect(isEmailSpy).toBeCalledWith('valid_email@mail.com')
  })
})
