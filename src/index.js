require("dotenv").config();
const express = require('express');
const fs = require('fs');
const app = express();
const { google } = require("googleapis");

const { Client,
        IntentsBitField, 
        GatewayIntentBits,
        // Collection, // Collection class for managing the commands
        Events, // Events class for managing the events
      } = require("discord.js");
// const fs = require('node:fs');
// const path = require('node:path');

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

console.log("loading commands...");
require("./load_commands.js").execute(client);
console.log("commands loaded.");

client.on("ready", (c) => {
  console.log(`${c.user.displayName} is online.`);
});

/** Maintenance Ground */
client.on(Events.InteractionCreate, async interaction => {
  /**
   * This code listens for the InteractionCreate event, which is emitted whenever an interaction is created in the Discord client.
   * If the command exists, it attempts to execute the command.
   * If the command does not exist, it logs an error message.
   * reference: https://discordjs.guide/creating-your-bot/command-handling.html#executing-commands
   * 
   * @param {Interaction} interaction
   * 
   * @returns {Promise<void>}
   */

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
/*********************************************************** */

// TODO: Restructure the events in their own files
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "hello") {

    message.reply(`Hello ${message.author.displayName}, how can I help you?`);
  }
  else if (message.content === "keefak") {
    message.reply("Great, What about you?");
  }
});

/************************************************************ */

client.on('voiceStateUpdate', (oldState, newState) => {
  /**
   * This code listens for the VoiceStateUpdate event, which is emitted whenever a user changes voice state.
   * It logs when a user joins or leaves the meeting.
   * 
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   * 
   * @returns {void}
   * 
  */
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


const service = google.sheets("v4");
const credentials = require("../Form_101.json");
// Configure auth client
const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

(async function () {
    try { 
        // Authorize the client
        const token = await authClient.authorize();
        // Set the client credentials
        authClient.setCredentials(token);

        // Get the rows
        const res = await service.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: "1GyvhxGdu6wgqnWoIcZBdhPZflyABChLw431eO_RfB1k",
            range: "A:E",
        });

        // All of the answers
        const answers = [];
        // Set rows to equal the rows
        const rows = res.data.values;

        // Check if we have any data and if we do add it to our answers array
        if (rows.length) {
            // Remove the headers
            rows.shift()
            // For each row
            const lastRow = rows[rows.length - 1];
            answers.push({
                notes: lastRow[1],
                future_tasks: lastRow[2],
                Next_meeting: lastRow[3],
                Next_Location: lastRow[4],
              });
        } else {
            console.log("No data found.");  
        }

        // Saved the answers
        fs.writeFileSync("answers.json", JSON.stringify(answers), function (err, file) {
            if (err) throw err;
            console.log("Saved!");
        });

    } catch (error) {
        // Log the error
        console.log(error);
        // Exit the process with error
        process.exit(1);
    }
})();


client.login(process.env.TOKEN);
