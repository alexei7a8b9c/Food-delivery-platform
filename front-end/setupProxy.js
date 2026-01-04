const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log('🔄 Setting up proxy middleware...');

    // Proxy for API
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8080', // API Gateway
            changeOrigin: true,
            secure: false,
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
                console.log(`📤 Proxying ${req.method} ${req.path} -> ${proxyReq.path}`);
            },
            onProxyRes: (proxyRes, req, res) => {
                console.log(`📥 Response ${proxyRes.statusCode} from ${req.path}`);
            }
        })
    );

    // Proxy for uploads
    app.use(
        '/uploads',
        createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
        })
    );

    console.log('✅ Proxy configured for /api and /uploads -> http://localhost:8080');
};