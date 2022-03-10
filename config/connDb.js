require('dotenv').config()
const dbPsw = process.env.DB_PSW

const knex = require('knex')

const db = knex({
	client:'pg',
	connection:{
		host:'127.0.0.1',
		user:'postgres',
		password:dbPsw,
		database:'emporium'
	}
})

const authDb = knex({
	client:'pg',
	connection:{
	host:'127.0.0.1',
	user:'postgres',
	password:dbPsw,
	database:'authDb'
	}
})

module.exports = {db,authDb}