const config = require('./config.json');
const language = require(`./lang/${config.bot.language}.json`);
const fastify = require('fastify')({ logger: config.webserver.logging });
const moment = require('moment');
const { Bot, InlineKeyboard, Composer } = require('grammy');
const MessageBuilder = require('./utils/MessageBuilder');
const crypto = require('crypto');

const bot = new Bot(config.bot.token);

// User Commands

const userCommands = new Composer();

userCommands.command('start', require('./commands/Start'));

bot.use(userCommands);

// Admin Commands

const adminCommands = new Composer();

adminCommands.use((ctx, next) => {

    if(config.bot.admins.some((admin) => admin == ctx.from?.id))
        next();

    return;

});

adminCommands.on('callback_query:data', require('./callbacks/CallbackHandler'));

adminCommands.command('chatid', require('./commands/ChatID'));

bot.use(adminCommands);

bot.start();

fastify.post(config.webserver.webhookEndpoint, async (req, res) => {

    // check signature if secret is set in config

    if(config.webserver.secret != "") {

        let requestSignature = req.headers['x-hub-signature-256'];
        
        let signature = crypto.createHmac('sha256', config.webserver.secret)
            .update(JSON.stringify(req.body))
            .digest('hex');
    
        if(requestSignature.replace('sha256=', '') != signature)
            return res.send(400);

    }

    if(req.body.zen)
        return await bot.api.sendMessage(
            config.bot.groupID, 
            new MessageBuilder(language.newWebhook)
                .setParam('{repoUrl}', req.body.repository.html_url)
                .setParam('{repoName}', req.body.repository.name)
                .build(), 
            { parse_mode: 'HTML' }
        );

    let medias = [];
    let commitMessages = '';

    for(let commit of req.body.commits) {
        let message = commit.message;

        if (commit.message.contains("-media")) {
            const split = commit.message.split(' ')
            const index = split.indexOf("-media")

            message = commit.message.replace('-media', '')
            if (split.length > index) {
                message = message.replace(split[index+1], '')
                medias.push(split[index+1])
            }
        }

        
        commitMessages += new MessageBuilder(language.commitMessage)
            .setParam('{commitMessage}', message)
            .build()
        
    }
    
    let message = new MessageBuilder(language.pushMessage)
        .setParam('{repoName}', req.body.repository.name)
        .setParam('{branchName}', req.body.ref.split('/').slice(2, req.body.ref.length).join('/'))
        .setParam('{commitMessages}', commitMessages)
        .setParam('{userProfileUrl}', req.body.sender.html_url)
        .setParam('{userProfileName}', req.body.pusher.name)
        .setParam('{pushDate}', moment(req.body.head_commit.timestamp).format('D/M/YYYY H:mm'))

    if(config.bot.addRepoLinkIfPublic && !req.body.repository.private)
        message.setParam('{repoUrl}', req.body.repository.html_url);

    message = message.build();

    await bot.api.sendMessage(config.bot.groupID, message, { 
        parse_mode: 'HTML', 
        reply_markup: new InlineKeyboard()
            .text(language.acceptButton, 'accepted')
            .text(language.rejectButton, 'rejected'),
        disable_web_page_preview: !config.bot.repoUrlPreview
    });

    for (let media of medias) {
        await bot.api.sendVideo(config.bot.groupID, media, { 
            parse_mode: 'HTML', 
            reply_markup: new InlineKeyboard()
                .text(language.acceptButton, 'accepted')
                .text(language.rejectButton, 'rejected'),
            disable_web_page_preview: true
        });
    }

    res.send(200);

});

fastify.get(config.webserver.webhookEndpoint, async (req, res) => {

    res.send(language.randomMessages[Math.floor(Math.random() * language.randomMessages.length)]);

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