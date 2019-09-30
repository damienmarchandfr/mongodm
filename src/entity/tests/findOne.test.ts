import { MongODMConnection } from '../../connection/connection'
import { MongODMEntity } from '../entity'
import { MongODMField } from '../../decorators/field.decorator'

const databaseName = 'findoneTest'

describe('static method findOne', () => {
	it('should throw an error if collection does not exist', async () => {
		const connection = await new MongODMConnection({
			databaseName,
		}).connect({
			clean: false,
		})

		class RandomClassWithoutDecoratorFindOne extends MongODMEntity {
			name: string

			constructor() {
				super()
				this.name = 'toto'
			}
		}

		let hasError = false

		try {
			await RandomClassWithoutDecoratorFindOne.findOne<
				RandomClassWithoutDecoratorFindOne
			>(connection, { name: 'toto' })
		} catch (error) {
			hasError = true
			expect(error.message).toEqual(
				`Collection randomclasswithoutdecoratorfindone does not exist.`
			)
			expect(error.code).toEqual('MONGODM_ERROR_404')
		}

		expect(hasError).toEqual(true)
	})

	it('should findOne', async () => {
		class UserFindOneStatic extends MongODMEntity {
			@MongODMField()
			email: string

			constructor() {
				super()
				this.email = 'damien@marchand.fr'
			}
		}

		const connection = await new MongODMConnection({
			databaseName,
		}).connect({
			clean: true,
		})

		// Insert user with mongodb native lib
		await connection.collections.userfindonestatic.insertOne(
			new UserFindOneStatic()
		)

		const user = await UserFindOneStatic.findOne<UserFindOneStatic>(
			connection,
			{
				email: 'damien@marchand.fr',
			}
		)

		expect(user).not.toBe(null)
		expect((user as UserFindOneStatic).email).toEqual('damien@marchand.fr')
	})

	it('should not find and return null', async () => {
		class UserFindOneStaticNull extends MongODMEntity {
			@MongODMField()
			email: string

			constructor() {
				super()
				this.email = 'damien@marchand.fr'
			}
		}

		const connection = await new MongODMConnection({
			databaseName,
		}).connect({
			clean: true,
		})

		// Insert user with mongodb native lib
		await connection.collections.userfindonestaticnull.insertOne(
			new UserFindOneStaticNull()
		)

		const user = await UserFindOneStaticNull.findOne(connection, {
			email: 'donal@trump.usa',
		})

		expect(user).toEqual(null)
	})
})
