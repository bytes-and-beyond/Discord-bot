const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs/promises');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('end-meeting')
    .setDescription('Meeting ended now!'),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Load startTime from file each time the command is executed
    let startTime = null;
    try {
      const data = await fs.readFile('startTime.txt', 'utf-8');
      if (data) {
        startTime = parseInt(data, 10);
      }
    } catch (error) {
      console.error("Error loading startTime:", error);
    }

    // If no startTime is set, reply with no meeting message
    if (!startTime) {
      await interaction.reply("No meeting in progress!");
      return;
    }

    const endTime = Date.now();
    const durationInSeconds = Math.floor((endTime - startTime) / 1000); // Total duration in seconds

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const formattedTime = `${today.getHours()}:${today.getMinutes().toString().padStart(2, '0')}`;
    const formlink = 'https://shorturl.at/o9q62';

    const data = {
      formattedDate,
      formattedTime,
      durationHours: hours,
      durationMinutes: minutes,
      durationSeconds: seconds,
    };

    await interaction.reply(`Meeting ended!\nDuration: ${hours}h ${minutes}m ${seconds}s.\n[Submit feedback here](${formlink})`);

    try {
      await fs.writeFile('End_meeting.json', JSON.stringify(data, null, 2));
      console.log('Meeting data saved.');
    } catch (error) {
      console.error("Error saving meeting data:", error);
    }

    try {
      await fs.writeFile('startTime.txt', '');
      console.log('startTime cleared.');
    } catch (error) {
      console.error("Error clearing startTime:", error);
    }
  },
};
