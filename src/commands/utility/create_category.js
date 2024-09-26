/**
 * This command creates a new category in a Discord server along with a set of predefined channels 
 * (General, Brainstorming, Meeting Minutes, GitHub, Tasks, and a voice channel), 
 * as well as any optional custom channels specified by the user.
 * 
 * Options:
 * - `category-name` (required): The name of the new category to be created.
 * - `channel-1`, `channel-2`, `channel-3` (optional): The names of custom channels to be added inside the category.
 * 
 * Execution Flow:
 * 1. The command begins by checking whether the `category-name` already exists in the guild.
 *    - If it exists, it replies that the category already exists and stops execution.
 * 
 * 2. If the category does not exist:
 *    - It creates the category in the guild and replies with a confirmation message.
 *    - Several default channels are created in this category:
 *      - `general`: A text channel for general discussions.
 *      - `brainstorming`: A text channel for idea generation.
 *      - `meeting-minutes`: A text channel for recording meeting notes.
 *      - `github`: A text channel dedicated to GitHub discussions and tasks.
 *      - `tasks`: A forum channel for organizing tasks.
 *      - A voice channel named after the category.
 * 
 * 3. The command then checks for any custom channels specified in the `channel-1`, `channel-2`, or `channel-3` options:
 *    - For each custom channel, the command ensures the channel name:
 *      - Does not exceed 20 characters.
 *      - Does not duplicate the name of an existing channel within the same category.
 *    - If valid, the custom channels are created as text channels in the newly created category.
 * 
 * Error Handling:
 * - If any error occurs during the creation process (e.g., API failure, permission issues), the user is notified, and the error is logged.
 * 
 * Usage Example:
 * 
 * /create-category category-name:"Project Team" channel-1:"announcements" channel-2:"resources"
 * 
 * This command would create a category called "Project Team" with the following channels:
 * - general, brainstorming, meeting-minutes, github, tasks, Project Team Voice Channel, announcements, resources.
 */

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-category')
        .setDescription('Create a new category with the necessary channels.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName('category-name')
                .setDescription('The name of the category.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName("channel-1")
            .setDescription("The name for custom channel 1")
        )
        .addStringOption(option =>
            option.setName("channel-2")
            .setDescription("The name for custom channel 2")
        )
        .addStringOption(option =>
            option.setName("channel-3")
            .setDescription("The name for custom channel 3")
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        const categoryName = interaction.options.getString('category-name');

        // Check if the category already exists
        const category = interaction.guild.channels.cache.find(channel => channel.name === categoryName);
        if (category) {
            await interaction.reply(`Category **${categoryName}** already exists.`);
            return;
        }
        
        const channelNames = ["general", "brainstorming", "meeting-minutes", "github", "tasks", categoryName + " Voice Channel"];
        
        try {
            await interaction.deferReply();
            
            // Create the category
            const newCategory = await interaction.guild.channels.create({
                name: categoryName, 
                type: ChannelType.GuildCategory,
                reason: 'New category created!',
            });
            await interaction.editReply(`Category **${categoryName}** has been created!`);
            
            // Create the general channel inside the newly created category
            await interaction.guild.channels.create({
                name: channelNames[0],
                type: ChannelType.GuildText,
                parent: newCategory.id,
                reason: 'General channel created in new category.',
            });
            await interaction.followUp(`Channel **${channelNames[0]}** has been created!`);

            // Create the brainstorming channel inside the newly created category
            await interaction.guild.channels.create({
                name: channelNames[1],
                type: ChannelType.GuildText,
                parent: newCategory.id,
                reason: 'Brainstorming channel created in new category.',
            });
            await interaction.followUp(`Channel **${channelNames[1]}** has been created!`);

            // Create the meeting-minutes channel inside the newly created category
            await interaction.guild.channels.create({
                name: channelNames[2],
                type: ChannelType.GuildText,
                parent: newCategory.id,
                reason: 'Meeting-minutes channel created in new category.',
            });
            await interaction.followUp(`Channel **${channelNames[2]}** has been created!`);

            // Create the github channel inside the newly created category
            await interaction.guild.channels.create({
                name: channelNames[3],
                type: ChannelType.GuildText,
                parent: newCategory.id,
                reason: 'Github channel created in new category.',
            });
            await interaction.followUp(`Channel **${channelNames[3]}** has been created!`);

            // Create the tasks channel inside the newly created category
            await interaction.guild.channels.create({
                name: channelNames[4],
                type: ChannelType.GuildForum,
                parent: newCategory.id,
                reason: 'Tasks forum channel created in new category.',
            });
            await interaction.followUp(`Channel **${channelNames[4]}** has been created!`);

            // Create the voice channel inside the newly created category
            await interaction.guild.channels.create({
                name: channelNames[5],
                type: ChannelType.GuildVoice,
                parent: newCategory.id,
                reason: 'Voice channel created in new category.',
            });
            await interaction.followUp(`Channel **${channelNames[5]}** has been created!`);

            // Create custom channels
            for (let i = 1; i <= 3; i++) {
                const channelName = interaction.options.getString(`channel-${i}`);
                if (channelName) {
                    if (channelNames.includes(channelName)) {
                        await interaction.followUp(`Channel **${channelName}** already exists.`);
                        continue;
                    }
                    if (channelName.length > 20) {
                        await interaction.followUp(`Channel name **${channelName}** is too long. Should be less than 20 characters.`);
                        continue;
                    }
                    await interaction.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: newCategory.id,
                        reason: `Custom channel ${i} created in new category.`,
                    });
                    await interaction.followUp(`Channel **${channelName}** has been created!`);
                }
                else break;
            }

        } catch (error) {
            console.error("Error creating category:", error);
            await interaction.editReply("There was an error creating the category. Please try again.");
        }
    },
};
