const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs/promises');
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Temporary storage for webhook data
let meetingData = {};

async function readEndMeetingFile() {
    try {
        const data = await fs.readFile('End_meeting.json', 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading End_meeting.json file:", error);
        return { durationMinutes: "N/A" }; // Default value
    }
}

async function readFormFile() {
    try {
        const data1 = await fs.readFile('answers.json', 'utf-8');
        const parsedData = JSON.parse(data1);
        return [parsedData[parsedData.length - 1]];
    } catch (error) {
        console.error("Error reading answers.json file:", error);
        return { formLink: "N/A" }; // Default value
    }
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('display-meeting')
        .setDescription('These are the details of the meeting'),

    async execute(interaction) {
        const data1 = await readFormFile();
        const endMeetingData = await readEndMeetingFile();
        
        // Check if data1 contains at least one entry and destructure properties safely
        if (data1 && data1[0]) {
            const { durationMinutes } = endMeetingData;
            const { notes, future_tasks, Next_meeting, Next_Location } = data1[0];

            // Create the response message
            const responseMessage = `
                # **Meeting Summary**
                
                📅 **Date:**   
                        ${new Date().toLocaleDateString()}
                
                ⏲️ **Time:** 
                        ${new Date().toLocaleTimeString()}
                
                ⌚ **Duration:**    
                        ${durationMinutes} min
                
                👥 **Attendees (5+ mins):** 
                        No specific attendees
                
                📝  **Notes:** ${notes || 'No notes provided'}
                
                **Future Tasks:** ${future_tasks || 'No tasks provided'}
                
                **Next Meeting:** ${Next_meeting || 'No meeting scheduled'}
                
                **Next Location:** ${Next_Location || 'No location provided'}
            `;

            // Send the response back to Discord
            await interaction.reply(responseMessage);
        } else {
            // Handle case where there is no meeting data
            await interaction.reply("No meeting data available.");
        }
    }
};