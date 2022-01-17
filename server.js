require('dotenv').config()

const express = require('express')
const knex = require('knex')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dbPsw = process.env.DB_PSW

const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds);

const app = express()
app.use(cors())
app.use(express.json())

const db = knex({
	client:'pg',
	connection:{
		host:'127.0.0.1',
		user:'postgres',
		password:dbPsw,
		database:'emporium'
	}
})

app.get('/',(req,res)=>{res.send('<marquee>Emporium BackEnd</marquee>')})

function authenticationToken(req,res,next){
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if(token === null) return res.sendStatus(401)

	jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
		if(err) return res.sendStatus(403)
		req.user = user
		next()
	})
}

app.listen(3001,()=>{
	console.log('Server listen on 3001')
})