const { createEmbed } = require('./embed');

module.exports = {
  time: async function (interaction) {
    await interaction.reply({ embeds: [createEmbed()] });
  },

  reset: function (interaction) {
    interaction.reply('Invalid command');
  },

  invalid: function (interaction) {
    interaction.reply('Invalid command');
  }
};

