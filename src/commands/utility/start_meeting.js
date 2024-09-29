const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs/promises');

let startTime = null;

const saveStartTime = async (newStartTime) => {
  try {
    await fs.writeFile("startTime.txt", newStartTime.toString());
  } catch (error) {
    console.error("Error saving startTime:", error);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-meeting')
    .setDescription('Meeting started now!'),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    startTime = Date.now();
    await saveStartTime(startTime);
    await interaction.reply('Meeting just started!');
  },
};
