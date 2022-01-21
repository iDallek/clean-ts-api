import { AccountModel, AddAccountModel, AddAccountRepository, Encrypter } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncrypterStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (accountData: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'hashed_password'
      }
      return await new Promise(resolve => resolve(fakeAccount))
    }
  }

  return new AddAccountRepositoryStub()
}

interface SutTypes {
  SUT: DbAddAccount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
}

const makeSUT = (): SutTypes => {
  const encrypterStub = makeEncrypter()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const SUT = new DbAddAccount(encrypterStub, addAccountRepositoryStub)

  return {
    SUT,
    encrypterStub,
    addAccountRepositoryStub
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

  test('Should throw if Encrypter throws', async () => {
    const { SUT, encrypterStub } = makeSUT()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

    const promise = SUT.add(accountData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { SUT, addAccountRepositoryStub } = makeSUT()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

    await SUT.add(accountData)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    })
  })

  test('Should throw if Encrypter throws', async () => {
    const { SUT, addAccountRepositoryStub } = makeSUT()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

    const promise = SUT.add(accountData)
    await expect(promise).rejects.toThrow()
  })
})
