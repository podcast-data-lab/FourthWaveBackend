const swaggerOptions = {
    routePrefix: '/documentation',
    exposeRoute: true,
    swagger: {
        info: {
            title: '4thWave API',
            description: '4thWave API - A podcast platform for the future.',
            version: '1.0.0',
        },
        externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here',
        },
        host: 'localhost',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
    },
}

export default swaggerOptions
