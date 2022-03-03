const { ButtonInteraction, MessageEmbed, Channel } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const { TRANSCRIPTID } = require("../../config.json");
const DB = require("../../Schema/Ticket");

module.exports = {
    name: "interactionCreate",

    /**
     * 
     * @param {ButtonInteraction} interaction 
     */

    async execute(interaction) {
        if (!interaction.isButton()) return;
        const { guild, customId, channel, member } = interaction
        if (!["lock", "close", "unlock"].includes(customId)) return
        if (!member.permissions.has("ADMINISTRATOR")) return interaction.reply({ content: "You cannot use these buttons." });

        const Embed = new MessageEmbed().setColor("RED");

        DB.findOne({ ChannelID: channel.id }, async (err, docs) => {
            if (err) throw err;
            if (!docs) return interaction.reply({
                content: "No data was found related to this ticket, please delete manual.",
                ephemeral: true
            });

            switch (customId) {
                case "lock":
                    if (docs.Locked === true)
                        return interaction.reply({
                            content: "The ticket is already locked.",
                            ephemeral: true
                        });

                    await DB.updateOne({ ChannelID: channel.id }, { Locked: true });
                    Embed.setDescription("🔒 | This ticket is now locked for reviewing.")
                    channel.permissionOverwrites.edit(docs.MemberID, {
                        SEND_MESSAGES: false
                    });

                    interaction.reply({ embeds: [Embed] });
                    break;

                case "unlock":
                    if (docs.Locked === false)
                        return interaction.reply({
                            content: "The ticket is already unlocked.",
                            ephemeral: true
                        });

                    await DB.updateOne({ ChannelID: channel.id }, { Locked: false });
                    Embed.setDescription("🔓 | This ticket is now unlocked.")
                    channel.permissionOverwrites.edit(docs.MemberID, {
                        SEND_MESSAGES: true
                    });

                    interaction.reply({ embeds: [Embed] });
                    break;
                case "close":
                    if (docs.Closed === true)
                        return interaction.reply({
                            content: "Ticket is already close, please wait for it to be deleted.",
                            ephemeral: true
                        });

                    const attachment = await createTranscript(channel, {
                        limit: -1,
                        returnBuffer: false,
                        fileName: `${docs.Type} - ${docs.TicketID}.html`,
                    });
                    DB.updateOne({ ChannelID: channel.id }, { Closed: true });

                    let MEMBER = guild.members.cache.get(docs.MemberID);
                    if(MEMBER === undefined){
                        return channel.delete();

                    }
                    const Message = await guild.channels.cache.get(TRANSCRIPTID).send({
                        embeds: [
                            Embed.setAuthor({
                                name: MEMBER.user.tag,
                                iconURL: MEMBER.displayAvatarURL({ dynamic: true })
                            }).setTitle(`Transcript type: ${docs.Type}\nID: ${docs.TicketID}`),
                        ],
                        files: [attachment]

                    });
                    interaction.reply({
                        embeds: [
                            Embed.setDescription(
                                `The transcript is now saved [TRANSCRIPT](${Message.url})`
                            )
                        ]
                    });

                    setTimeout(() => {
                        channel.delete()
                    }, 10 * 1000)
            }
        });


    }
}