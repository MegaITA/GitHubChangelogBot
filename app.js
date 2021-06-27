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

bot.on('callback_query:data', (ctx) => {

    if(ctx.callbackQuery.data == 'accepted') {

        ctx.editMessageReplyMarkup({ 
            reply_markup: new InlineKeyboard()
                .text(`Accepted by ${ctx.from.first_name}`)
        });

        bot.api.sendMessage(config.bot.channelID, ctx.callbackQuery.message.text, { entities: ctx.callbackQuery.message.entities });

    } else if(ctx.callbackQuery.data == 'rejected') {

        ctx.editMessageReplyMarkup({ 
            reply_markup: new InlineKeyboard()
                .text(`Rejected by ${ctx.from.first_name}`)
        });

    }


    ctx.answerCallbackQuery();

});

// ADMIN COMMANDS

bot.command('chatid', (ctx) => {

    ctx.reply(ctx.chat.id);

});

bot.start();

fastify.post(config.webserver.webhookEndpoint, async (req, res) => {

    let message = '';
    
    
    message += `<i>✨ 1 nuovo aggioramento alla repo <b>${req.body.repository.name}</b></i>\n\n🌿 Branch: <code>${req.body.ref.split('/').slice(2, req.body.ref.length).join('/')}</code>\n\n`;

    for(let commit of req.body.commits) {

        message += `<i>• ${commit.message}</i>\n\n`;
    
    }

    message += `<b>👤 Autore:</b> <a href="${req.body.sender.html_url}">${req.body.pusher.name}</a>\n`;
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