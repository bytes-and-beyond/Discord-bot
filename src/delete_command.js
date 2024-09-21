/**
 * This script deletes a Discord slash command, either globally or within a specific guild, using the Discord API.
 * It accepts command-line arguments to determine whether the command is global or guild-specific, 
 * and the ID of the command to delete.
 * 
 * Script Parameters:
 * The script accepts two command-line arguments:
 * - `<global|guild>`: Specifies whether to delete a global or guild command.
 * - `<commandId>`: The ID of the command to be deleted.
 * 
 * Execution Flow:
 * 1. The script first loads the environment variables using `dotenv` and sets up the Discord REST client.
 * 2. It parses the command-line arguments to determine the command type (`global` or `guild`) and the command ID.
 *    - If the arguments are missing, it displays usage instructions and terminates the script.
 * 3. Based on the provided command type:
 *    - For `global`: The command will be deleted from the global scope using the provided `commandId`.
 *    - For `guild`: The command will be deleted from the specified guild using both the `guildId` and `commandId`.
 * 
 * Error Handling:
 * - If an invalid command type is provided, the script will display an error message and terminate.
 * - If the deletion fails (e.g., due to incorrect command ID, permission issues, or API failure), an error will be logged.
 */

require('dotenv').config();  // Load environment variables from .env file
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const clientId = process.env.CLIENT_ID;  // Replace with your bot's client ID
const guildId = process.env.GUILD_ID;   // Replace with your guild's ID, if it's a guild command
const token = process.env.TOKEN;       // Replace with your bot's token

const rest = new REST({ version: '10' }).setToken(token);

async function deleteCommand() {
    const args = process.argv.slice(2); // Skip the first two elements (node and script path)

    if (args.length < 1) {
        console.log('Usage: node deleteCommand.js <global|guild> <commandId>');
        process.exit(1);
    }

    const type = args[0];
    const commandId = args[1];

    try {
        if (type.toLowerCase() === 'global') {
            await rest.delete(Routes.applicationCommand(clientId, commandId));
            console.log('Global command deleted successfully.');
        } else if (type.toLowerCase() === 'guild') {
            await rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId));
            console.log('Guild command deleted successfully.');
        } else {
            console.log('Invalid command type. Use "global" or "guild".');
            process.exit(1);
        }
    } catch (error) {
        console.error('Failed to delete command:', error);
    }
}

deleteCommand();
