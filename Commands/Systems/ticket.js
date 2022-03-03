const { MessageEmbed, CommandInteraction, MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
  name: 'ticket',
  description: 'Set Up your ticketing message.',

  /**
     *
     * @param {CommandInteraction} interaction
     */
  async execute (interaction) {
    const embed = new MessageEmbed().setDescription('You can\'t use this command')
    if (!interaction.member.permissions.has('ADMINISTATOR')) return interaction.reply({ embeds: [embed], ephemeral: true })
    const { guild } = interaction

    const Embed = new MessageEmbed()
      .setAuthor(
        guild.name + ' | Ticketing System',
        guild.iconURL({ dynamic: true })
      )
      .setDescription('Welcome to **OSRS SERVICES**. All our services are hand made and done via \n**Nord VPN**. We also take orders on proxies on your request. For more information, please react below.')
      .addField('Services', 'Click on <a:skills:853386714168819753> for Hand made Services work (Skilling, Questing and Minigames)')
      .addField('Buy Gold', 'Click on <:coins_icon:853392355067035709> to buy gold')
      .addField('Buy accounts', 'Click on <:BTC:853398763392466944> to buy an account')
      .addField('All quotes / trades  are done via Tickets only', 'We don\'t Quote / Collect any Money outside the Scope of tickets, all confirmation are done via tickets only\n\nAdditional fees may apply for ironman or hardcore ironman services.')
      .setColor('RED')
      .setFooter('Powered By BottingHub.com')

    const Buttons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('services')
          .setLabel('Services')
          .setStyle('PRIMARY')
          .setEmoji('<a:skills:853386714168819753>'),
        new MessageButton()
          .setCustomId('gold')
          .setLabel('Gold')
          .setStyle('DANGER')
          .setEmoji('<:coins_icon:853392355067035709>'),
        new MessageButton()
          .setCustomId('accounts')
          .setLabel('Buy Accounts')
          .setStyle('SUCCESS')
          .setEmoji('<:BTC:853398763392466944>')

      )

    await guild.channels.cache
      .get(process.env.OPENTICKET)
      .send({ embeds: [Embed], components: [Buttons] })

    interaction.reply({ content: 'Done.', ephemeral: true })
  }
}
