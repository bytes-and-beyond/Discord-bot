require('dotenv').config();  // Load environment variables from .env file
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const clientId = process.env.CLIENT_ID;  // Replace with your bot's client ID
const guildId = process.env.GUILD_ID;   // Replace with your guild's ID, if it's a guild command
const token = process.env.TOKEN;       // Replace with your bot's token

const rest = new REST({ version: '10' }).setToken(token);

async function fetchGlobalCommands() {
    /**
     * This function fetches all global commands registered for the bot.
     * 
     * @param {void}
     * @returns {Promise<void>}
     * @exception {Error} If an error occurs while fetching global commands.
     */
    try {
        console.log('Fetching global commands...');
        const commands = await rest.get(Routes.applicationCommands(clientId));
        console.log('Global Commands:', commands.map(cmd => ({
            name: cmd.name,
            id: cmd.id,
            description: cmd.description
        })));
    } catch (error) {
        console.error('Error fetching global commands:', error);
    }
}

async function fetchGuildCommands() {
    /**
     * This function fetches all guild commands registered for the bot in a specific guild.
     * 
     * @param {void}
     * @returns {Promise<void>}
     * @exception {Error} If an error occurs while fetching guild commands.
     */
    try {
        console.log('Fetching guild commands...');
        const commands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
        console.log('Guild Commands:', commands.map(cmd => ({
            name: cmd.name,
            id: cmd.id,
            description: cmd.description
        })));
    } catch (error) {
        console.error('Error fetching guild commands:', error);
    }
}

fetchGlobalCommands();
fetchGuildCommands();
