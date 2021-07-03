const { Composer } = require('grammy');

module.exports = new Composer().use(
    async (ctx) => {

        ctx.reply(ctx.chat.id);

    }
)