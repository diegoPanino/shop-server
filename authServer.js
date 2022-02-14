import signIn from './controller/signInController.js'
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

const authDb = knex({
	client:'pg',
	connection:{
	host:'127.0.0.1',
	user:'postgres',
	password:dbPsw,
	database:'authDb'
	}
})

async function addRefreshToken(token){
	try{
		const res = await authDb('refreshToken').insert({refreshToken:token})
		if(res.length > 0)
			return false
		else
			return true
	}
	catch(err){
		console.log('authServer error adding RT',err) 
		return false
	}
}

function generateAccessToken(user){
	return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m'})
}

function authenticateToken(req,res,next){
	const token = req.get('Authorization')
	if(token == null) return res.status(401)

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user)=>{
		if(err) return res.status(403).json(err)
		req.user = user
		next()
	})
}


app.post('/token',(req,res)=>{
	const refreshToken = req.get('x-refresh')
	if(refreshToken == null) return res.status(401).send('refresh token null')
	
	authDb.select('refreshToken').from('refreshToken').where('refreshToken','=',refreshToken )
	.then(data => {
		if(!data.length) return res.sendStatus(403) //if not in the db
		jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
			if(err) return res.sendStatus(403) //if is not valid
			const accessToken = generateAccessToken({name:user.name,email:user.email})
			res.json({accessToken})
		})	
	})
	
})

app.delete('/logout',authenticateToken, async (req,res) => {
	const token = req.get('x-refresh')
	try{
		const result = await authDb.select('refreshToken').from('refreshToken').where('refreshToken','=',token )
		if(!result[0].refreshToken.length) return res.sendStatus(401)
		const isDelete = authDb('refreshToken').where('refreshToken',token).del()
		if(isDelete) return res.sendStatus(200)
		return res.Status(401)
	}
	catch(err){
		console.log('authServer.js log out err',err)
	}
})
app.post('/signup',(req,res)=>{
	const {username,email,psw} = req.body
	const hash = bcrypt.hashSync(psw,salt)
	db('user').insert({
		name:username,
		email:email,
		password:hash
	})
	.then(queryResult => {
		res.sendStatus(200)
	})
	.catch(err => {
		switch(err.code){
			case '23505': {
				res.status(400).send({error:'Account already taken!'})
				break
			}
			default:{
				res.status(400).json('No possible register you! Sorry :(')		
				break
			}
		}
	})
})

app.post('/login',(req,res)=>{
	const {email,psw} = req.body
	db.select('email','password').from('user').where('email','=',email)
	.then( data =>{
		bcrypt.compare(psw,data[0].password,(err,isValid)=>{
			if(isValid){
				return db.select('name','email','avatar').from('user').where('email','=',email)
				.then(async userData => {
					const user = {name:userData[0].name,email:userData[0].email}
					const accessToken = generateAccessToken(user)
					const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
					const addRfrTknFlag =  await addRefreshToken(refreshToken)
					
					if(!addRfrTknFlag) 	throw new Error()
					res.json({a:accessToken,r:refreshToken})
				})
				.catch(err =>{												
					res.status(400).json('No possible to log in')//can happen because addRefreshToken fail or because 
				}) //or problem gettin the info of the user status 5xx sounds better
			}
			else{
				res.status(400).json('Check your password and/or email')//psw incorrect
			}
		})
	})
	.catch(err =>{
		res.status(400).json('Check your password and/or email')//user doesn't exist
	})

})

app.listen(4001,()=>{
	console.log('Auth Server listen on 4001')
})