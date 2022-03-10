const {authDb} = require('../config/connDb.js')
const {evaluateRefreshToken,generateAccessToken} = require('../helper/token.js')

const saveRefreshToken = async (token,id) => {
	try{
		//check if already exist a refresh token for the user
		let queryResult
		const recordId = await authDb.select('id').from('refreshToken').where('id_auth','=',id)
		//if does not exist, create one
		if(recordId.length === 0)
			queryResult = await authDb('refreshToken').insert({refreshToken:token,id_auth:id})
		//if exist update with new token
		else
			queryResult = await authDb('refreshToken').where('id_auth','=',id).update({refreshToken:token})
		//if no error return true otherwise return false
		if(queryResult.length > 0) return false
		else return true
		}
	catch(err)	{return false}
}

const handleRefreshToken = async (req,res) => {
	//check if refresh token is stored in cookie
	const {cookies} = req
	if(!cookies?.jwt) return res.sendStatus(401)
	
	//check if refresh token is stored in db
	const refreshToken = cookies.jwt
	const refreshTokenInDb = await authDb.select('*').from('refreshToken').where('refreshToken','=',refreshToken)
	if(refreshTokenInDb.length === 0) return res.sendStatus(403)
	
	//evaluate token and if the owner is the registered email
	const {err,decoded} = evaluateRefreshToken(refreshToken)
	const userEmail = await authDb.select('email').from('auth').where('id','=',decoded.id)
	if(err || userEmail.length === 0) return res.sendStatus(403)
	
	//generate new accessToken
	const accessToken = generateAccessToken({email:userEmail[0].email,id:decoded.id})
	res.status(200).send({a:accessToken})
}

module.exports = {saveRefreshToken,handleRefreshToken}