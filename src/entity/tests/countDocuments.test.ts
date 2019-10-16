import { LegatoEntity } from '..'
import { LegatoConnection } from '../../connection'
import { LegatoField } from '../../decorators/field.decorator'

const databaseName = 'countDocumentsTest'

describe('static method countDocuments', () => {
	it('should throw an error if collection does not exist', async () => {
		class RandomClassWithoutDecoratorCountDocumentsStatic extends LegatoEntity {
			name: string

			constructor() {
				super()
				this.name = 'toto'
			}
		}

		await new LegatoConnection({
			databaseName,
		}).connect({
			clean: false,
		})

		let hasError = false

		try {
			await RandomClassWithoutDecoratorCountDocumentsStatic.countDocuments({
				name: 'toto',
			})
		} catch (error) {
			hasError = true
			expect(error.message).toEqual(
				`Collection randomclasswithoutdecoratorcountdocumentsstatic does not exist.`
			)
			expect(error.code).toEqual('Legato_ERROR_404')
		}

		expect(hasError).toEqual(true)
	})

	it('should count all documents', async () => {
		class UserCountAllStatic extends LegatoEntity {
			@LegatoField()
			email: string

			constructor(email: string) {
				super()
				this.email = email
			}
		}

		const connection = await new LegatoConnection({
			databaseName,
		}).connect({
			clean: true,
		})

		const users: UserCountAllStatic[] = []
		// Add 10 users
		for (let i = 0; i < 10; i++) {
			users.push(new UserCountAllStatic('damien@dev.fr'))
		}
		await connection.collections.usercountallstatic.insertMany(users)

		const count = await UserCountAllStatic.countDocuments(connection)
		expect(count).toEqual(10)
	})

	it('should count documents with query filter', async () => {
		class UserCountDocumentsQueryFilter extends LegatoEntity {
			@LegatoField()
			email: string

			constructor(email: string) {
				super()
				this.email = email
			}
		}

		const connection = await new LegatoConnection({
			databaseName,
		}).connect({
			clean: true,
		})

		const users: UserCountDocumentsQueryFilter[] = []
		// Add 10 users
		for (let i = 0; i < 10; i++) {
			users.push(new UserCountDocumentsQueryFilter('damien@dev.fr'))
		}
		// User in filter
		users.push(new UserCountDocumentsQueryFilter('jeremy@dev.fr'))

		await connection.collections.usercountdocumentsqueryfilter.insertMany(users)

		const count = await UserCountDocumentsQueryFilter.countDocuments({
			email: 'jeremy@dev.fr',
		})
		expect(count).toEqual(1)
	})
})