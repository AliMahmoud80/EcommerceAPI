import { ModelStatic } from 'sequelize'
import { Inject, Service } from 'typedi'
import { ValidationError } from '@/api/errors'
import { hashPassword } from './utils'
import { sign, verify } from 'jsonwebtoken'
import { IUserPayload } from '@/interfaces'
import { UserCredentialsDTO } from '@/api/dtos'
import { Supplier, User } from '@/models'
import { transformAndValidate } from 'class-transformer-validator'
import config from '@/config'

type authenticationResult = {
  user: User
  token: string
}

@Service()
export class AuthService {
  constructor(@Inject('User') private userModel: ModelStatic<User>) {}

  /**
   * Authenticate user and generate jwt token.
   *
   * @param userCredentials User credentials
   * @throws {ValidationError} If the user credentials are invalid
   * @returns {authenticationResult} Object contains authenticated user instance and jwt_token
   */
  async authenticate(
    userCredentials: UserCredentialsDTO
  ): Promise<authenticationResult> {
    const { email, password } = await transformAndValidate(
      UserCredentialsDTO,
      userCredentials
    )

    const user = await this.userModel.findOne({
      where: { email },
      attributes: { include: ['password'] },
      include: [
        {
          model: Supplier,
        },
      ],
    })

    if (!user) {
      throw new ValidationError({
        detail: 'Email is not registered',
        meta: {
          attribute: 'email',
          value: email,
        },
      })
    }

    if (user.getDataValue('password') !== hashPassword(password)) {
      throw new ValidationError({ detail: 'Invalid user credentials' })
    }

    const token = this.signToken(user)

    return { user, token }
  }

  /**
   * Sign JWT token.
   *
   * @param user User instance
   * @returns JWT Token
   */
  signToken(user: User): string {
    const payload: Omit<IUserPayload, 'iat' | 'exp'> = {
      id: user.getDataValue('id').toString(),
      first_name: user.getDataValue('first_name'),
      last_name: user.getDataValue('last_name'),
      email: user.getDataValue('email'),
      phone_number: user.getDataValue('phone_number'),
      country: user.getDataValue('country'),
      region: user.getDataValue('region'),
      address: user.getDataValue('address'),
      role_id: user.getDataValue('role_id').toString(),
      supplier: null,
      created_at: user.getDataValue('created_at'),
      updated_at: user.getDataValue('updated_at'),
    }

    if (user.Supplier) {
      payload.supplier = {
        name: user.Supplier.getDataValue('name'),
        email: user.Supplier.getDataValue('email'),
        phone_number: user.Supplier.getDataValue('phone_number'),
        country: user.Supplier.getDataValue('country'),
        region: user.Supplier.getDataValue('region'),
        address: user.Supplier.getDataValue('address'),
        created_at: user.Supplier.getDataValue('created_at'),
        updated_at: user.Supplier.getDataValue('updated_at'),
      }
    }

    return sign(payload, config.app.jwtSecret, {
      expiresIn: '7d',
    })
  }

  /**
   * Verify the JWT and return the payload
   *
   * @param token JWT token
   * @returns Payload extracted from the JWT
   */
  verifyToken(token: string): IUserPayload {
    return verify(token, config.app.jwtSecret) as IUserPayload
  }
}
