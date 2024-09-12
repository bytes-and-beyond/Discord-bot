const {SlashCommandBuilder, Collection} = require('discord.js');
const fs = require('fs/promises');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end-meeting')
        .setDescription('Meeting ended now!'),
    async execute(interaction) {
        let attendees = new Map(); // Used a Map to store users and the time they joined

        if (!interaction.isChatInputCommand()) return;

        const Today = new Date();
        if (!startTime) {
            interaction.reply("No meeting in progress!");
            return;
        }
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const minutes = Math.floor(duration / 60);   
        const formattedDate = `${Today.getDate()}/${Today.getMonth() + 1}/${Today.getFullYear()}`;
        const formattedTime = `${Today.getHours()}:${Today.getMinutes() < 10 ? '0' : ''}${Today.getMinutes()}`;
        
        // Filter attendees who have stayed 5 minutes (5 mins as example) or more
        const attendeesList = Array.from(attendees.entries())
            .filter(([displayName, joinTime]) => (endTime - joinTime) >= 300000) // 5 mins in milliseconds
            .map(([displayName]) => displayName);

        await interaction.reply(`# **Meeting Summary**
            📅 **Date:** ${formattedDate}
            ⏲️ **Time:** ${formattedTime}
            ⌚ **Duration:** ${minutes} min
            📍 **Location:** Voice Channel
            # **👥 Attendees (5+ mins):** attendeesList.length > 0 ? attendeesList.join(', ') : 'None'
            `);

        startTime = null;
        attendees.clear(); //clearing the attendees map when ending the meeting

        // await interaction.reply('Meeting ended!');
    },
};

const loadStartTime = async () => { //when meeting ends
    try {
      const data = await fs.readFile('startTime.txt', 'utf-8'); 
      startTime = parseInt(data, 10);
    } catch (error) {
      console.error("Error loading startTime:", error);
    }
};
