const DATA = 'http://localhost:3001'
const ROUTES = [
	{
		url:'/user',
		rateLimit:{
			windowsMs: 15 * 60 * 1000,
			max:5
		},
		proxy: {
			target:`${DATA}/user`,
			pathRewrite:{
				['^/user'] : '',
			}
		}
	},
]
module.exports = ROUTES