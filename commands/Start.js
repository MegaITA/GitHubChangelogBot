const { Composer } = require('grammy');

module.exports = new Composer().use(
    async (ctx) => {

        if(ctx.chat.type != 'private')
            return;

        ctx.reply(`Benvenuto ${ctx.from.first_name} nel ChangeLog bot di Nadiria.\n\n👨🏻‍💻 Sviluppato da @Mega_01`);

    }
)