import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../../errors'
import { EmailValidator, AccountModel, AddAccount, AddAccountModel, HttpRequest } from './singup-protocols'
import { badRequest, ok, serverError } from '../../helpers/http-helper'

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new AddAccountStub()
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})

interface SutTypes {
  SUT: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
}

const makeSUT = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const SUT = new SignUpController(emailValidatorStub, addAccountStub)

  return {
    SUT,
    emailValidatorStub,
    addAccountStub
  }
}

describe('SingUp Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const { SUT } = makeSUT()
    const httpRequest = {
      body: {
        // name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await SUT.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest((new MissingParamError('name'))))
  })

  test('Should return 400 if no email is provided', async () => {
    const { SUT } = makeSUT()
    const httpRequest = {
      body: {
        name: 'any_name',
        // email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await SUT.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest((new MissingParamError('email'))))
  })

  test('Should return 400 if no password is provided', async () => {
    const { SUT } = makeSUT()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        // password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = await SUT.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest((new MissingParamError('password'))))
  })

  test('Should return 400 if no password confirmation is provided', async () => {
    const { SUT } = makeSUT()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
        // passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await SUT.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest((new MissingParamError('passwordConfirmation'))))
  })

  test('Should return 400 if password confirmation fails', async () => {
    const { SUT } = makeSUT()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'invalid_password'
      }
    }
    const httpResponse = await SUT.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest((new InvalidParamError('passwordConfirmation'))))
  })

  test('Should return 400 if an invalid email is provided', async () => {
    const { SUT, emailValidatorStub } = makeSUT()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpResponse = await SUT.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest((new InvalidParamError('email'))))
  })

  test('Should call EmailValidator with correct email', async () => {
    const { SUT, emailValidatorStub } = makeSUT()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    await SUT.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should return 500 if EmailValidator throws', async () => {
    const { SUT, emailValidatorStub } = makeSUT()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })

    const httpResponse = await SUT.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError((new ServerError())))
  })

  test('Should return 500 if AddAccount throws', async () => {
    const { SUT, addAccountStub } = makeSUT()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })

    const httpResponse = await SUT.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError((new ServerError())))
  })

  test('Should call AddAccount with correct values', async () => {
    const { SUT, addAccountStub } = makeSUT()
    const addSpy = jest.spyOn(addAccountStub, 'add')

    await SUT.handle(makeFakeRequest())

    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return 200 if valid data is provided', async () => {
    const { SUT } = makeSUT()

    const httpResponse = await SUT.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok(makeFakeAccount()))
  })
})
