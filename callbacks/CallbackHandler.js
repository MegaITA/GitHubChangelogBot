const { Composer, InlineKeyboard } = require('grammy');
const config = require('../config.json');
const language = require(`../lang/${config.bot.language}.json`);
const MessageBuilder = require('../utils/MessageBuilder');

module.exports = new Composer().use(
    async (ctx) => {

        if(ctx.callbackQuery.data == 'accepted') {

            ctx.editMessageReplyMarkup({ 
                reply_markup: new InlineKeyboard()
                    .text(
                        new MessageBuilder(language.statusAcceptedButton)
                            .setParam('{name}', ctx.from.first_name)
                            .build()
                    )
            });

            if (ctx.callbackQuery.message.video) {
                ctx.api.sendVideo(config.bot.channelID, ctx.callbackQuery.message.video, 
                    { 
                        disable_web_page_preview: !config.bot.repoUrlPreview
                    });
                return;
            }

            ctx.api.sendMessage(config.bot.channelID, ctx.callbackQuery.message.text, 
                { 
                    entities: ctx.callbackQuery.message.entities,
                    disable_web_page_preview: !config.bot.repoUrlPreview
                });
    
        } else if(ctx.callbackQuery.data == 'rejected') {
    
            ctx.editMessageReplyMarkup({ 
                reply_markup: new InlineKeyboard()
                    .text(
                        new MessageBuilder(language.statusRejectedButton)
                            .setParam('{name}', ctx.from.first_name)
                            .build()
                    )
            });
    
        }
    
    
        ctx.answerCallbackQuery();

    }
)