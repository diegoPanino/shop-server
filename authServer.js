const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const {logger} = require('./middleware/logEvents.js')
const corsOptions = require('./config/corsOption.js')
const credentials = require ('./middleware/credentials.js')
const verifyJwt = require('./middleware/verifyJwt.js')
const ROUTES = require('./config/routes.js')
const setupProxies = require('./middleware/proxy.js')

//middleware
const app = express()
app.use(logger)
app.use(credentials)
app.use(cors(corsOptions))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

//routes
app.use('/signup',require('./routes/register.js'))
app.use('/login',require('./routes/auth.js'))
app.use('/logout',require('./routes/logout.js'))
app.use('/refresh',require('./routes/refresh.js'))

app.use(verifyJwt)
//app.use('/user',createProxyMiddleware(ROUTES['/user'].proxy),require('controller'))
setupProxies(app,ROUTES)

/*
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
*/

app.listen(4001,()=>{
	console.log('Auth Server listen on 4001')
})