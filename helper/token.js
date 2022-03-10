const jwt = require('jsonwebtoken')

const generateAccessToken = value => {
	return jwt.sign(value,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m'})
}
const generateRefreshToken = value => {
	return jwt.sign(value,process.env.REFRESH_TOKEN_SECRET)
}
const evaluateAccessToken = token => {
	return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{return {err,decoded}})
}
const evaluateRefreshToken = token => {
	return jwt.verify(token,process.env.REFRESH_TOKEN_SECRET,(err,decoded)=>{return {err,decoded}})
}

module.exports = {generateAccessToken,generateRefreshToken,
				  evaluateAccessToken,evaluateRefreshToken}