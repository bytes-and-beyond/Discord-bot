const {SlashCommandBuilder} = require('discord.js');
const fs = require('fs/promises');

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

const saveStartTime = async (newStartTime) => { // for starting the meeting
  try {
    await fs.writeFile("startTime.txt", newStartTime.toString());
  } catch (error) {
    console.error("Error saving startTime:", error);
  }
};
