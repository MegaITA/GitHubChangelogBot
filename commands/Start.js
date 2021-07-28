const { Composer } = require('grammy');
const config = require('../config.json');
const language = require(`../lang/${config.bot.language}.json`);
const MessageBuilder = require('../utils/MessageBuilder');

module.exports = new Composer().use(
    async (ctx) => {

        if(ctx.chat.type != 'private')
            return;

        ctx.reply(new MessageBuilder(language.startMessage)
            .setParam('{firstName}', ctx.from.first_name)
            .build()
        , { parse_mode:'HTML' });

    }
)