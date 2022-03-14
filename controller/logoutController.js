const {authDb} = require('../config/connDb.js')

const handleLogout = async (req,res) => {
	const cookies = req.cookies
	//token not present in the cookies
	if(!cookies?.jwt) return res.sendStatus(204)
	const refreshToken = cookies.jwt
	try{
		//check if token is in db
		const cookieInDb = await authDb.select('*').from('refreshToken').where('refreshToken','=',refreshToken)
		if(cookieInDb.length === 0){
			res.clearCookie('jwt',{httpOnly:true,sameSite:'None',secure:true})
			return res.sendStatus(204)
		}//token not in db

		//delete token from db
		const deleteQueryRes = await authDb('refreshToken').where('id','=',cookieInDb[0].id).del() //should be an update with rt empty string ?

		res.clearCookie('jwt',{httpOnly:true,sameSite:'None',secure:true})
		res.sendStatus(204)
	}
	catch(err){
		console.log(err)
		res.sendStatus(500)
	}
}

module.exports = {handleLogout}