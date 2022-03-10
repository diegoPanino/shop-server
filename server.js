const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {db} = require('./config/connDb.js')
const {logger} = require('./middleware/logEvents.js')
const corsOptions = require ('./config/corsOption.js')
const credentials = require ('./middleware/credentials.js')

const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds);

const app = express()
app.use(logger)
app.use(credentials)
app.use(cors(corsOptions))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

app.get('/',(req,res)=>{res.send('<marquee>Emporium BackEnd</marquee>')})
/*app.get('*',(req,res)=>{
	console.log('server *')
	res.sendStatus(204)
})*/
app.get('/user',(req,res)=>{
	console.log('Server')
	res.sendStatus(204)
})
/*app.get('/user',authenticationToken,(req,res)=>{
	const {email} = req.user
	db.select('email','name','avatar').from('user').where('email','=',email)
	.then(user => {
		res.send(user[0])
	})
	.catch(err => {
		console.log('/user ',err)
		res.status(500).send(err)
	})
})*/

function authenticationToken(req,res,next){
	const token = req.get('Authorization')
	if(token == null) return res.sendStatus(401)

	jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
		if(err) return res.status(403).send(err)
		req.user = user
		next()
	})
}

app.listen(3001,()=>{
	console.log('Server listen on 3001')
})