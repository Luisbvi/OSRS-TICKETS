const { ButtonInteraction, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const DB = require("../../Schema/Ticket");
let { COUNTER, EVERYONEID, PARENTID} = require("../../config.json")

module.exports = {
    name: "interactionCreate",

    /**
     * 
     * @param {ButtonInteraction} interaction 
     */

    async execute(interaction) {
        if (!interaction.isButton()) return;
        const { guild, member, customId } = interaction;
        if (!["services", "gold", "accounts"].includes(customId)) return;

       const ID =  Math.floor(Math.random() * 9000 ) + 1000;

        await guild.channels.create(`${member.user.username + "-" + COUNTER.toString().padStart(4, "0")}`, {
            type: "GUILD_TEXT",
            parent: PARENTID,
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]
                },
                {
                    id: EVERYONEID,
                    deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]
                }

            ]
        }).then(async (channel) => {
            DB.create({
                GuildID: guild.id,
                MemberID: member.id,
                TicketID: ID,
                ChannelID: channel.id,
                Closed: false,
                Locked: false,
                Type: customId,
            });
            const Embed = new MessageEmbed()
                .setAuthor({
                    name: guild.name + " | Ticket ID: " + ID,
                    iconURL: guild.iconURL({ dynamic: true })
                })
                .setDescription(`Ticket for: **${customId}**\n\nSupport will assist you shortly. In the meantime, please check out our main website https://bottinghub.com/`)
                .setFooter({ text: "The buttons below are Staff Only." })
                .setColor("RED")

            const Buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("close")
                        .setLabel("Save & Close ticket")
                        .setStyle("PRIMARY")
                        .setEmoji("💾"),
                    new MessageButton()
                        .setCustomId("lock")
                        .setLabel("Lock")
                        .setStyle("SECONDARY")
                        .setEmoji("🔒"),
                    new MessageButton()
                        .setCustomId("unlock")
                        .setLabel("Unlock")
                        .setStyle("SUCCESS")
                        .setEmoji("🔓")
                );

            channel.send({ embeds: [Embed], components: [Buttons] });
            await channel.send({ content: `${member} here is your ticket` }).then((m) => {
                setTimeout(() => {
                    m.delete().catch(() => { });
                }, 1 * 5000);
            });
            interaction.reply({ content: `${member} your ticket has been created: ${channel}`, ephemeral: true })


        });
        COUNTER++


    }
}

