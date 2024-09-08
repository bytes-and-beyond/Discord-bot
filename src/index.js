require("dotenv").config();
const { EmbedBuilder } = require('discord.js'); 
const fs = require('fs/promises');
const { Client, IntentsBitField, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.displayName} is online.`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "hello") {
    message.reply(`Hello ${message.author.displayName}, how can I help you?`);
  }
  else if (message.content === "keefak") {
    message.reply("Great, What about you?");
  }
});

let attendees = new Map(); // Used a Map to store users and the time they joined
let startTime;

const loadStartTime = async () => {
  try {
    const data = await fs.readFile('startTime.txt', 'utf-8'); 
    startTime = parseInt(data, 10);
  } catch (error) {
    console.error('Error loading startTime:', error);
  }
};

const saveStartTime = async (newStartTime) => {
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
      await saveStartTime(startTime);
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
      
      // Filter attendees who have stayed 5 minutes (5 mins as example) or more
      const attendeesList = Array.from(attendees.entries())
        .filter(([displayName, joinTime]) => (endTime - joinTime) >= 300000) // 5 mins in milliseconds
        .map(([displayName]) => displayName);

      const meetingEmbed = new EmbedBuilder()
        .setColor(0x0099ff) 
        .setTitle('**Meeting Summary**')
        .addFields(
          { name: '📅 Date:', value: formattedDate, inline: true },
          { name: '⏲️ Time:', value: formattedTime, inline: true },
          { name: '⌚ Duration:', value: `${minutes} min`, inline: false },
          { name: '📍 Location:', value: 'Voice Channel', inline: false },
          { name: '👥 Attendees (5+ mins):', value: attendeesList.length > 0 ? attendeesList.join(', ') : 'None', inline: false }
        );

      interaction.reply({ embeds: [meetingEmbed] });
      startTime = null;
      attendees.clear(); //clearing the attendees map when ending the meeting
      break;
  }
});

loadStartTime();

client.on('voiceStateUpdate', (oldState, newState) => {
  console.log('Voice state updated');

  if (!startTime) {
    console.log('No meeting is in progress.');
    return; 
  }

  const channelID = '1278936251914911749'; // Voice channel ID

  // When a user joins the meeting
  if (!oldState.channelId && newState.channelId === channelID) {
    attendees.set(newState.member.user.displayName, Date.now());
    console.log(`${newState.member.user.displayName} joined the meeting.`);
  }

  // When a user leaves the meeting
  if (oldState.channelId === channelID && !newState.channelId) {
    attendees.delete(oldState.member.user.displayName);
    console.log(`${oldState.member.user.displayName} left the meeting.`);
  }
});

client.login(process.env.TOKEN);
