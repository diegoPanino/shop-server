const {evaluateAccessToken} = require('../helper/token.js')

const verifyJwt = (req,res,next) => {
	//grab and check if token exist
	const token = req.get('Authorization')
	if(!token) return res.sendStatus(401)

	//evaluate token and forward if a-ok
	const {err,decoded} = evaluateAccessToken(token)
	if(!err) return res.status(403).send(err)
	req.user = decoded.email
	next()
}

module.exports = verifyJwt