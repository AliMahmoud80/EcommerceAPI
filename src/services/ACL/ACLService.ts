import { ForbiddenOperation } from '@/api/errors'
import { IUserPayload } from '@/interfaces'
import { Ability, AbilityBuilder } from '@casl/ability'
import { Service } from 'typedi'
import { RoleService } from '../RoleService'
import subjectOwnershipFieldMapper from './subjectOwnershipFieldMap'

@Service({ transient: true })
export class ACLService {
  public ability: Ability

  constructor(private roleService: RoleService) {}

  /**
   * Define user abilities based on user role
   *
   * @returns {Ability} User abilities
   */
  public async init(user?: IUserPayload): Promise<Ability> {
    const { can, rules } = new AbilityBuilder(Ability)
    let supplierRules: typeof rules = []

    // Define guest users abilities
    if (!user) {
      this.ability = new Ability(this.getGuestUserRoles())
      return this.ability
    }

    // Define supplier abilities
    if (user.supplier) {
      supplierRules = this.getSupplierRules(user)
    }

    // Extract abilities from user permissions
    const permissions = await this.roleService.getRolePermissions(user.role_id)

    permissions.forEach((permission) => {
      const [action, subject, scope] = permission
        .getDataValue('name')
        .split(':')

      if (!scope) {
        can(action, subject)
      } else if (scope === 'all') {
        can(`${action}All`, subject)
      } else if (scope === 'own') {
        can(action, subject, {
          [subjectOwnershipFieldMapper[subject]]: user.id,
        })
      }
    })

    this.ability = new Ability(rules.concat(supplierRules), {
      detectSubjectType: (subject: Record<string, any>) =>
        subject.__subjectType,
    })

    return this.ability
  }

  /**
   * Authorize user for having the ability to perform an action or,
   * throw ForbiddenOperation {@link ForbiddenOperation} error
   *
   * @param abilityValidationFunction Function that uses ability to validate user authorization
   * @throws {ForbiddenOperation} If user is not authorized
   */
  authorizeUserOrFail(
    abilityValidationFunction: (ability: Ability) => boolean
  ) {
    const able = abilityValidationFunction(this.ability)

    if (!able) {
      throw new ForbiddenOperation()
    }
  }

  /**
   * Define guest user abilities
   *
   * @returns Guest user rules
   */
  private getGuestUserRoles() {
    return new Ability([
      {
        action: 'readAll',
        subject: 'product',
      },
      {
        action: 'readAll',
        subject: 'review',
      },
      {
        action: 'readAll',
        subject: 'category',
      },
      {
        action: 'readAll',
        subject: 'supplier',
      },
      {
        action: 'create',
        subject: 'user',
      },
      {
        action: 'create',
        subject: 'supplier',
      },
    ]).rules
  }

  /**
   * Define supplier  abilities
   *
   * @returns Guest user rules
   */
  private getSupplierRules(user: IUserPayload) {
    return new Ability([
      {
        action: 'update',
        subject: 'supplier',
        conditions: {
          user_id: user.id,
        },
      },
      {
        action: 'delete',
        subject: 'supplier',
        conditions: {
          user_id: user.id,
        },
      },
      {
        action: 'create',
        subject: 'product',
      },
      {
        action: 'update',
        subject: 'product',
        conditions: {
          supplier_id: user.id,
        },
      },
      {
        action: 'delete',
        subject: 'product',
        conditions: {
          supplier_id: user.id,
        },
      },
      {
        action: 'read',
        subject: 'sale',
        conditions: {
          supplier_id: user.id,
        },
      },
    ]).rules
  }
}

export default ACLService
