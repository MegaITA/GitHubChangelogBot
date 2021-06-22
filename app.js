const fastify = require('fastify')({ logger: true });
const config = require('./config.json');

fastify.get(config.webserver.webhookEndpoint, async (req, res) => {

    console.log('ciao', req);

});

(async () => {

    try {

        await fastify.listen(config.webserver.port);
        
    } catch (error) {

        fastify.log.error(error);

        if(config.webserver.shouldCloseOnError)
            process.exit(1);

    }

})()