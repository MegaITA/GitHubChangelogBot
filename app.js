const config = require('./config.json');
const fastify = require('fastify')({ logger: config.webserver.logging });
const moment = require('moment');
const { Bot } = require('grammy');

fastify.post(config.webserver.webhookEndpoint, async (req, res) => {

    console.log(req.body);

    let message = '';
    
    message += `<i>✨ 1 nuovo aggioramento alla repo <b>${req.body.repository.name}</b></i>\n\n🌿 Branch: <code>pisnelo</code>\n\n`;

    for(let commit of req.body.commits) {

        message += `<i>• ${commit.message}</i>\n\n`;
    
    }

    message += `<b>👤 Autore:</b> <code>${req.body.pusher.name}</code>\n`;
    message += `<b>📅 Data:</b> <code>${moment(req.body.head_commit.timestamp).format('M/D/YYYY H:mm')}</code>`;

    res.send(200);

});

fastify.get(config.webserver.webhookEndpoint, async (req, res) => {

    res.send('xQuickGlare è pelato e ne ho le prove');

});

(async () => {

    try {

        await fastify.listen(config.webserver.port, '0.0.0.0');
        
    } catch (error) {

        fastify.log.error(error);

        if(config.webserver.shouldCloseOnError)
            process.exit(1);

    }

})()