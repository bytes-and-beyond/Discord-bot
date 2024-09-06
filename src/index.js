require("dotenv").config();
const { EmbedBuilder } = require('discord.js'); 
const fs = require('fs/promises'); // Import a way to store constants in files
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.displayName} is online.`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return; // to prevent the bot from replying to itself

  if (message.content === "hello") {
    message.reply(`Hello ${message.author.displayName}, how can I help you?`); // fetch the user's display name
  }
  else if (message.content === "keefak") {
    message.reply("Great, What about you?");
  }
});



let startTime;

const loadStartTime = async () => { // in this function we will load the startTime from the file that we saved in the saveStartTime function
  try {
    const data = await fs.readFile('startTime.txt', 'utf-8'); 
    startTime = parseInt(data, 10); // Convert string back to number
  } catch (error) {
    console.error('Error loading startTime:', error);
  }
};

const saveStartTime = async (newStartTime) => { // save the value of startTime to a file
  try {
    await fs.writeFile('startTime.txt', newStartTime.toString());
  } catch (error) {
    console.error('Error saving startTime:', error);
  }
};



client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const Today = new Date();
  switch (interaction.commandName) {
    case 'start-meeting':
      startTime = Date.now();
      await saveStartTime(startTime); // Save startTime to file to not lose it when another instance of the bot starts
      interaction.reply('Meeting just started!');
      break;

    case 'end-meeting':
      if (!startTime) {
        interaction.reply('No meeting in progress!');
        return;
      }
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const minutes = Math.floor(duration / 60);   
      const formattedDate = `${Today.getDate()}/${Today.getMonth() + 1}/${Today.getFullYear()}`;
      const formattedTime = `${Today.getHours()}:${Today.getMinutes() < 10 ? '0' : ''}${Today.getMinutes()}`;
    
      const meetingEmbed = new EmbedBuilder()
        .setColor(0x0099ff) 
        .setTitle('**Meeting Summary**')
        
        .addFields(
          { name: '📅 Date:', value: formattedDate, inline: true },
          { name: '⏲️ Time:', value: formattedTime, inline: true },
          { name: '⌚ Duration:', value: `${minutes} min`, inline: false },
          { name: '📍 Location:', value: 'Voice Channel', inline: false }
        );
  
      interaction.reply({ embeds: [meetingEmbed] });
      startTime = null;
      break;
  }
});


loadStartTime(); // Load startTime from file on bot startup


client.login(process.env.TOKEN);
    