const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs/promises');
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Temporary storage for webhook data
let meetingData = {};

// Read JSON data from End_meeting.json
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
        const data1 = await fs.readFile('Form.json', 'utf-8');
        return JSON.parse(data1);
    } catch (error) {
        console.error("Error reading End_meeting.json file:", error);
        return { formLink: "N/A" }; // Default value
    }
}

// Setup webhook route
// app.post('/webhook', async (req, res) => {
//     const formData = req.body;
//     const { notes, future_tasks, next_meeting, next_location } = formData;

//     // Update the last meeting data
//     lastMeetingData = { notes, future_tasks, next_meeting, next_location };

//     console.log('Data received and updated:', lastMeetingData);
//     res.status(200).send('Data received and updated');
// });
// Start listening on the webhook for form data submissions
//app.listen(3000, () => console.log('Webhook is listening on port 3000'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display-meeting')
        .setDescription('These are the details of the meeting'),

    async execute(interaction) {
        // Read the End_meeting.json file
        const endMeetingData = await readEndMeetingFile();
        const { durationMinutes } = endMeetingData;

        // Access stored webhook data
        const data1 = await readFormFile();
        const { notes = 'No notes provided', future_tasks = 'No tasks provided', next_meeting = 'No meeting scheduled', next_location = 'No location provided' } = data1;

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
            
            📝  **Notes:**
                    ${notes}
            
            **Future Tasks:**
                    ${future_tasks}
            
            **Next Meeting:**
                    ${next_meeting}
            
            **Next Location:**
                    ${next_location}
        `;

        await interaction.reply(responseMessage);
    },
};
