const config = require('./config.json');
const fastify = require('fastify')({ logger: config.webserver.logging });
const moment = require('moment');
const { Bot, InlineKeyboard } = require('grammy');

const bot = new Bot(config.bot.token);

// USER COMMANDS

bot.command('start', (ctx) => {

    if(ctx.chat.type != 'private')
        return;

    ctx.reply(`Benvenuto ${ctx.from.first_name} nel ChangeLog bot di Nadiria.\n\n👨🏻‍💻 Sviluppato da @Mega_01`);

});


bot.use((ctx, next) => {

    if(!(ctx.message?.text?.startsWith('/')))
        return next();

    for(let admin of config.bot.admins) {

        if(admin == ctx.from.id)
            return next();
        
    }
    
    ctx.reply('Comando riservato agli admin');

    return false;

});

// ADMIN COMMANDS

bot.command('chatid', (ctx) => {

    ctx.reply(ctx.chat.id);

});

bot.start();

fastify.post(config.webserver.webhookEndpoint, async (req, res) => {

    let message = '';
    
    message += `<i>✨ 1 nuovo aggioramento alla repo <b>${req.body.repository.name}</b></i>\n\n🌿 Branch: <code>${req.body.ref.split('/')[2]}</code>\n\n`;

    for(let commit of req.body.commits) {

        message += `<i>• ${commit.message}</i>\n\n`;
    
    }

    message += `<b>👤 Autore:</b> <code>${req.body.pusher.name}</code>\n`;
    message += `<b>📅 Data:</b> <code>${moment(req.body.head_commit.timestamp).format('D/M/YYYY H:mm')}</code>`;

    await bot.api.sendMessage(config.bot.groupID, message, { 
        parse_mode: 'HTML', 
        reply_markup: new InlineKeyboard()
            .text('✅ Accetta', 'accepted')
            .text('❌ Rifiuta', 'rejected')
    });

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