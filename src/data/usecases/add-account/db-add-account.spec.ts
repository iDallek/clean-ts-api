import { Encrypter } from '../../protocols/encrypter'
import { DbAddAccount } from './db-add-account'

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncrypterStub()
}

interface SutTypes {
  SUT: DbAddAccount
  encrypterStub: Encrypter
}

const makeSUT = (): SutTypes => {
  const encrypterStub = makeEncrypter()
  const SUT = new DbAddAccount(encrypterStub)

  return {
    SUT,
    encrypterStub
  }
}

describe('DbAddAccount Usecase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { SUT, encrypterStub } = makeSUT()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

    await SUT.add(accountData)
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })
})
