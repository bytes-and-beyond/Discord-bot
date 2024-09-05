require("dotenv").config();
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
  if (message.author.bot) return;

  if (message.content === "hello") {
    message.reply("Hi akhoy! Shlonak?");
  }
  else if (message.content === "keefak") {
    message.reply("Al7amdulillah, w enta?");
  }
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isChatInputCommand())return;
  if (interaction.commandName){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; 
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    interaction.reply(`
      **Meeting Minutes**
      📅 Date: ${year}-${month}-${day}
      ⏰ Time: ${hours}-${minutes}
      ⏳ Duration: 
      📍 Location: `);
  }
})

client.login(process.env.TOKEN);
