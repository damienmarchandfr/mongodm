import { createConnectionString, LegatoConnection } from '.'
import { LegatoField } from '../decorators/field.decorator'
import { LegatoIndex } from '../decorators/index.decorator'
import { LegatoEntity } from '../entity'

const databaseName = 'connectiontest'

describe('createConnectionString function', () => {
	it('must return a valid connection string with all parameters', () => {
		const url = createConnectionString({
			username: 'damien',
			password: 'toto',
			host: 'localhost',
			port: 8080,
			databaseName,
		})

		expect(url).toEqual('mongodb://damien:toto@localhost:8080/' + databaseName)
	})

	it(`must return a valid connection string with just database name set`, () => {
		const url = createConnectionString({
			databaseName,
		})

		expect(url).toEqual(`mongodb://localhost:27017/${databaseName}`)
	})
})

describe('connect function', () => {
	it('must have collections if models loaded', async () => {
		class ConnexionUser extends LegatoEntity {
			@LegatoField()
			field: string

			constructor() {
				super()
				this.field = 'toto'
			}
		}

		const legato = new LegatoConnection({
			databaseName,
		})
		await legato.connect()

		expect(legato.collections.connexionusers).toBeDefined()
	})

	it('must return same if already connected', async () => {
		const connection = new LegatoConnection({
			databaseName,
		})

		await connection.connect()

		const newConnection = await connection.connect()

		expect(connection).toStrictEqual(newConnection)
	})

	it('must create index', async () => {
		class Indexed extends LegatoEntity {
			@LegatoIndex({
				unique: false,
			})
			firstname: string

			constructor() {
				super()
				this.firstname = 'Damien'
			}
		}

		const connection = new LegatoConnection({
			databaseName,
		})

		await connection.connect()

		const indexes = await connection.collections.indexed.listIndexes().toArray()
		expect(indexes[1].key.firstname).toEqual(1)
	})

	it('must clean collections if clean = true', async () => {
		class Cleaned extends LegatoEntity {
			@LegatoField()
			field: string

			constructor() {
				super()
				this.field = 'value'
			}
		}

		const connection = await new LegatoConnection({
			databaseName,
		}).connect()

		expect(connection.collections.cleaned).toBeDefined()

		await connection.collections.cleaned.insertOne(new Cleaned())

		// Create new connection with clean = true
		const secondConnection = await new LegatoConnection({
			databaseName,
		}).connect({
			clean: true,
		})
		expect(secondConnection.collections.cleaned).toBeDefined()

		const count = await secondConnection.collections.cleaned.countDocuments()
		expect(count).toEqual(0)
	})
})

describe('disconnect function', () => {
	it('must throw an error if not connected', async () => {
		const legato = new LegatoConnection({
			databaseName,
		})

		let hasError = false

		try {
			await legato.disconnect()
		} catch (error) {
			expect(error.message).toEqual(
				'Mongo client not conected. You cannot disconnect.'
			)
			expect(error.code).toEqual('Legato_ERROR_500')
			hasError = true
		}

		expect(hasError).toBe(true)
	})

	it('must accept disconnect after a connection', async () => {
		class City extends LegatoEntity {
			@LegatoField()
			name: string

			constructor() {
				super()
				this.name = 'Aix en Provence'
			}
		}

		const connection = new LegatoConnection({
			databaseName,
		})

		await connection.connect()
		expect(connection.collections.city).toBeDefined()

		await connection.disconnect()
		expect(connection.collections).toStrictEqual({})
	})
})

describe('clean function', () => {
	it('must throw error if not connected', async () => {
		const connection = new LegatoConnection({
			databaseName,
		})

		let hasError = false

		try {
			await connection.clean()
		} catch (error) {
			expect(error.message).toEqual(
				`You are not connected to a Mongo database.`
			)
			expect(error.code).toEqual('Legato_ERROR_500')
			hasError = true
		}

		expect(hasError).toBe(true)
	})

	it('should clean all collections', async () => {
		class User extends LegatoEntity {
			@LegatoField()
			firstname: string

			constructor() {
				super()
				this.firstname = 'Damien'
			}
		}

		class Job extends LegatoEntity {
			@LegatoField()
			name: string

			constructor() {
				super()
				this.name = 'clown'
			}
		}

		const connection = await new LegatoConnection({
			databaseName,
		}).connect()

		await connection.collections.job.insertOne(new Job())
		await connection.collections.user.insertOne(new User())

		await connection.clean()

		// Count all users
		const usersCount = await connection.collections.user.countDocuments()
		expect(usersCount).toEqual(0)

		// Count all jobs
		const jobsCount = await connection.collections.job.countDocuments()
		expect(jobsCount).toEqual(0)
	})
})

describe('checkCollectionExists function', () => {
	it('should return false if connection does not exist', async () => {
		const connection = await new LegatoConnection({
			databaseName,
		}).connect({
			clean: false,
		})

		const exists = connection.checkCollectionExists('user123NeverUsed')

		expect(exists).toEqual(false)
	})

	it('should return true if collection exists', async () => {
		class User extends LegatoEntity {
			@LegatoField()
			firstname: string

			constructor() {
				super()
				this.firstname = 'Damien'
			}
		}

		const connection = await new LegatoConnection({
			databaseName,
		}).connect({
			clean: false,
		})

		const exists = connection.checkCollectionExists('user')

		expect(exists).toEqual(true)
	})
})