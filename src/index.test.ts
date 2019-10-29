import { setConnection, getConnection } from './index'
import { LegatoConnection } from './connection'

const databaseName = 'rroro'

describe('set connection', () => {
	beforeEach(() => {
		if (getConnection()) {
			setConnection(null)
		}
	})

	it('should throw error if set a disconnect LegatoConnection', () => {
		const connection = new LegatoConnection({
			databaseName,
		})

		let hasError = false

		try {
			setConnection(connection)
		} catch (error) {
			hasError = true
		}

		expect(hasError).toBeTruthy()
	})
})