const {db,authDb} = require('../config/connDb.js')
const bcrypt = require('bcrypt')
const {generateAccessToken,generateRefreshToken} = require('../helper/token.js')
const {saveRefreshToken} = require('./refreshController.js')

const handleLogin = async (req,res) => {
	//request has to have email and password
	const {email,psw} = req.body
	if(!email || !psw) return res.status(400).send('All field are required')
	//retrieve hashed psw from db and check if with bcrypt
	try{
		const user = await authDb.select('*').from('auth').where('email','=',email)
		if(user.length !== 1) return res.status(401).send('Check your password and/or email')
	//if password match create access token and refresh token with email and auth db ID
	//save refresh token in db, send access token and set cookie with refresh token
		const match = await bcrypt.compare(psw,user[0].password)
		if(match){
			const accessToken = generateAccessToken({email:user[0].email,id:user[0].id})
			const refreshToken = generateRefreshToken({email:user[0].email,id:user[0].id})
			if(!saveRefreshToken(refreshToken,user[0].id)) throw new Error()
			res.cookie('jwt',refreshToken,{httpOnly:true,sameSite:'None',secure:true})//maxAge:60000
			res.status(200).send({a:accessToken})
		}
		else
			res.status(401).send('Check your password and/or email')
	}
	catch(err){
		console.log('authController.js err',err)
		res.sendStatus(500)
	}
}

module.exports = {handleLogin}