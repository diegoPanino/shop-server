const { createProxyMiddleware} = require('http-proxy-middleware')

const setupProxies = (app,routes) =>  {
	routes.forEach(route => {
		app.use(route.url,createProxyMiddleware(route.proxy))
	})
}

module.exports = setupProxies