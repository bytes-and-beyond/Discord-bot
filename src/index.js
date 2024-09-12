require("dotenv").config();

const { EmbedBuilder } = require('discord.js'); 
const fs = require('fs/promises');
const { Client,
        IntentsBitField, 
        GatewayIntentBits,
        Collection, // Collection class for managing the commands
        Events, // Events class for managing the events
      } = require("discord.js");

/** Maintenance */

const fs1 = require('node:fs');
const path = require('node:path');

/****************************** */

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

client.commands = new Collection(); // Collection for managing the commands

/** Maintenance Ground */

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs1.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs1.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// client.on(Events.InteractionCreate, interaction => {
// 	if (!interaction.isChatInputCommand()) return;
// 	console.log(interaction);
// });

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
/****************************** */

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
    console.error("Error loading startTime:", error);
  }
};

const saveStartTime = async (newStartTime) => {
  try {
    await fs.writeFile("startTime.txt", newStartTime.toString());
  } catch (error) {
    console.error("Error saving startTime:", error);
  }
};

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const Today = new Date();
  switch (interaction.commandName) {
    case "start-meeting":
      startTime = Date.now();

      await saveStartTime(startTime);
      interaction.reply('Meeting just started!');

      break;

    case "end-meeting":
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

      interaction.reply(`# **Meeting Summary**
        📅 **Date:** ${formattedDate}
        ⏲️ **Time:** ${formattedTime}
        ⌚ **Duration:** ${minutes} min
        📍 **Location:** Voice Channel
         # **👥 Attendees (5+ mins):** attendeesList.length > 0 ? attendeesList.join(', ') : 'None'
        `);

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
