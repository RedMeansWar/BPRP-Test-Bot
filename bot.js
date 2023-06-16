const 
{ 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    EmbedBuilder, 
    REST, 
    Routes, 
    ButtonBuilder, 
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');

const { TeamSpeak } = require('ts3-nodejs-library');
const randomstring = require('randomstring');
const mysql = require('mysql');
const fs = require('fs');
const config = require('./config');
const emoji = require('./emoji');
const logger = require('./logger');

// Logger Stuff
const Error = logger.LogError;
const LogFramework = logger.LogFramework;
const Debug = logger.LogDebug;
const LogTeamSpeak = logger.LogTeamSpeak;
const Info = logger.LogInfo;

const writeToCommandLog = (message) => {
    fs.readFile('command.log', 'utf-8', (err, data) => {
        if (err) throw err;

        const lines = data.split("\n");
        const updatedMessage = message.split("\n").join("\n");
        const updateData = [...lines, updatedMessage].join("\n");
        
        fs.writeFile('command.log', updateData, (err) => { if (err) throw err; });
    });
}

const writeToTsLog = (message) => {
    fs.readFile('teamspeak.log', 'utf-8', (err, data) => {
        if (err) throw err;

        const lines = data.split("\n");
        const updatedMessage = message.split("\n").join("\n");
        const updateData = [...lines, updatedMessage].join("\n");
        
        fs.writeFile('teamspeak.log', updateData, (err) => { if (err) throw Error(err); });
    });
}

const writeToFrameworkLog = (message) => {
    fs.readFile('framework.log', 'utf-8', (err, data) => {
        if (err) throw err;

        const lines = data.split("\n");
        const updatedMessage = message.split("\n").join("\n");
        const updateData = [...lines, updatedMessage].join("\n");
        
        fs.writeFile('framework.log', updateData, (err) => { if (err) throw Error(err); });
    });
}

const LogToCommandFile = writeToCommandLog;
const LogToFrameworkFile = writeToFrameworkLog;
const LogToTeamSpeakFile = writeToTsLog;

const date = new Date();

const year = date.getFullYear();
const month = date.getUTCMonth() + 1;
const day = date.getUTCDay();
const hours = date.getUTCHours();
const minutes = date.getUTCMinutes();
const seconds = date.getUTCSeconds();

const timestamp = `${year}-${month}-${day} @ ${hours}:${minutes}:${seconds}`

// Register Client and REST (used for registering Guild Events and Bits)
const client = new Client({
    intents: 
    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildWebhooks
    ],
});

const rest = new REST().setToken(config.bot.token);
// rest.delete(Routes.applicationCommand(config.bot.clientId, '1118768084342296656')).then(() => console.log("[BPRP Bot]: Deleted Command"));

// TeamSpeak 3 connection
const teamspeak = new TeamSpeak({
    host: config.teamspeak.ts3Host,
    queryport: 10011,
    serverport: 9987,
    username: config.teamspeak.ts3Name,
    password: config.teamspeak.ts3Pass
});

// Connect to Master DB
const database = mysql.createConnection({
    host: config.database.dbHost,
    user: config.database.dbUsername,
    password: config.database.dbPassword,
    port: config.database.dbPort,
    timeout: config.database.timeout
});

// Console output
client.on('ready', () => {
    console.log('[BPRP]: Bot Online');
});

database.connect(function(err) {
    console.log('[MySQL]: Connect to Master Database');
});

teamspeak.on('ready', () => {
    console.log('[TS3]: Connected to Main TeamSpeak');
});

// Bot Features / Varibles
client.on('ready', () => {
    client.user.setActivity("BPRP", { type: ActivityType.Playing });
});

const guild = client.guilds.cache.get();

let command;

//#region Command Creation
client.on('ready', () => {
    
    if (guild) {
        command = guild.commands;
    } else {
        command = client.application?.commands;
    }

    /*
    1 - Sub command
    2 - Sub command group
    3 - String
    4 - Int
    5 - Boolean
    6 - user
    7 - Channel
    8 - Role
    9 - Mentionable
    10 - Number (any double between -2^53 and 2^53)
    11 - Attachment
    */

    ////// Command Registration //////
    command.create({
        name: "temp-pass",
        description: "Creates a 5 Minute Temporary Password for the Main TeamSpeak."
    });
    command.create({ 
        name: "set-aop",
        description: "Set the AOP of the server. Changes on the AOP on TeamSpeak as well.",
        options: 
        [
            {
                name: "aop",
                description: "Set the aop type.",
                type: 3, // string type
                required: true,
                choices: 
                [ 
                    {
                        name: "statewide",
                        value: "Statewide"
                    },
                    {
                        name: "blaine-county",
                        value: "Blaine County"
                    },
                    {
                        name: "los-santos",
                        value: "Los Santos"
                    },
                    { 
                        name: "vespucci",
                        value: "Vespucci"
                    },
                    {
                        name: "alamo",
                        value: "Alamo"
                    },
                    {
                        name: "chiliad",
                        value: "Chiliad"
                    },
                    {
                        name: "vinewood-hills",
                        value: "Vinewood Hills"
                    },
                    {
                        name: "vespucci-beach",
                        value: "Vespucci Beach"
                    },
                    {
                        name: "mirror-park",
                        value: "Mirror Park"
                    },
                ],
            },
        ]
    });

    command.create({
        name: "reset-aop",
        description: "Resets the AOP to \"AOP: Not Set\""
    });

    command.create({
        name: "info",
        description: "Gives an embed of all info for BPRP"
    });

    command.create({
        name: "ban",
        description: "Ban a user from all BPRP Assets",
        options:
        [
            {
                name: "ban-user",
                description: "The user to ban",
                type: 6, // user type
                required: true,
            },
            {
                name: "ts-uid",
                description: "The unique identifer of the user to ban from server assests",
                type: 3, // string type
                required: true // I can't get this from a database until I code the API.
            },
            {
                name: "website-id",
                description: "The website id of the user to ban",
                type: 4, // int type
                required: false
            },
            {
                name: "ban-reason",
                description: "the reason to ban the user",
                type: 3, // string type
                required: false
            }
        ]
    });

    command.create({
        name: "remove-tags",
        description: "Removes all TeamSpeak tags a user.",
        options:
        [
            {
                name: "ts3-uid",
                description: "The unique identifer of the user to remove tags from",
                type: 3, // string type
                required: true
            }
        ]
    });

    command.create({
        name: "patrol-alert",
        description: "Sends out a vote for an Roleplay Session to start.",
        options: 
        [
            {
                name: "date",
                description: "the date for the rp to start",
                type: 3, // string type
                required: true
            }
        ]
    });

    command.create({ 
        name: "restart-script",
        description: "restarts certain server scripts.",
        options: 
        [
            {
                name: "script",
                description: "script you with to restart",
                type: 3, // string type
                required: true
            }
        ]
    });

    command.create({
        name: "restart-bot",
        description: "Restarts the bot."
    })

    command.create({
        name: "server-restart",
        description: "Restarts a specific BPRP FiveM Server.",
        options: 
        [
            {
                name: "server",
                description: "the server to restart",
                type: 3, // string type
                required: true
            }
        ]
    })

    command.create({
        name: "bot-info",
        description: "Shows bot information."
    });

    command.create({
        name: "server-info",
        description: "Displays BPRP FiveM server information.",
        options:
        [
            {
                name: "server-name",
                description: "the name of the server you wish to look information about",
                type: 3, // string type
                required: true
            }
        ]
    });
    
    command.create({
        name: "client-info",
        description: "Displays client information.",
        options: 
        [
            {
                name: "member-search",
                description: "the user to search up",
                type: 6, // user type
                required: true
            }
        ]
    });

    command.create({
        name: "dev-server-info",
        description: "Gives discord server information."
    });
    
    command.create({
        name: "dev-send-release",
        description: "Sends out a development release to the main server.",
        options:
        [
            {
                name: "release-link",
                description: "the link that has the release information on. (added, changed)",
                type: 3, // string type 
                required: true
            }
        ]
    });
    
    command.create({
        name: "rename-ts-channel",
        description: "Rename any channel on teamspeak. You need the channel Id for this to work.",
        options:
        [
            {
                name: "channel-id",
                description: "channel Id of the teamspeak channel you wish to rename",
                type: 4, // int type
                required: true
            },
            {
                name: "rename-channel",
                description: "what you want the channel name to be.",
                type: 3, // string type
                required: true
            }
        ]
    })

    command.create({
        name: "purge",
        description: "Purge/Clear a certain amount of messages in a channel.",
        options: 
        [
            {
                name: "purge-amount",
                description: "The amount of messages you wish to delete",
                type: 4, // int type
                required: true
            }
        ]
    })
});

//#endregion

//#region Command Interaction
client.on('interactionCreate', async (interaction) => {
   if (!interaction.isChatInputCommand()) return;
   // Varibles
   var { commandName, options } = interaction;
   var username = interaction.user.username;
   var tempPassGen = randomstring.generate(8);
   var tempPass = tempPassGen;
   
   /// Command Code ///
   if (commandName == "temp-pass") {
    const tempPassEmbed = new EmbedBuilder()
    .setTitle("BPRP Temporary Password")
    .setFooter({ text: "BPRP Development Department", iconURL: config.devLogo }) 
    .setTimestamp()
    .setColor('Red')
    .addFields
    ({
        name: "TeamSpeak IP:",
        value: "ts.beachpointrp.com"
    },
    {
        name: "Password:",
        value: `${tempPass}`
    },
    {
        name: "Duration:",
        value: "5 Minutes"
    }) 
    .setFooter({ text: "BPRP Development Team", iconURL: "https://media.discordapp.net/attachments/1116557870910148639/1116559638121418782/BPRP_DEV.png?width=1002&height=1004"});
    teamspeak.serverTempPasswordAdd({ pw: tempPass, duration: 300, desc: `generated via bot by ${interaction.member.displayName}(${interaction.member.id})`})
    
    await interaction.reply({ embeds: [tempPassEmbed] });

    LogTeamSpeak(`Temporary Password Created by ${username}. Logging.`)

    const logTs = `${timestamp} - ${username} created a teamspeak password.`;
    const logCmd = `${timestamp} - ${username} used /temp-pass.`;
    
    LogToTeamSpeakFile(logTs)
    LogToCommandFile(logCmd)
   }

   // This to WAYYY to long to code
   if (commandName == "set-aop") {
    const aopCategory = options.getString('aop');

    teamspeak.channelEdit(124, {
        channelName: `AOP: ${aopCategory}`
    });
    interaction.reply({ content: `AOP Updated to: ${aopCategory}`, ephemeral: true});
    // logs
    LogFramework(`AOP Updated to ${aopCategory}. Logging in 2 files`);

    const logTS = `${timestamp} - ${username} changed the aop to ${aopCategory}`;
    const logFW = `${timestamp} - ${username} changed the aop to ${aopCategory}`;
    const logCmd = `${timestamp} - ${username} used /set-aop`;

    LogToFrameworkFile(logFW);
    LogToTeamSpeakFile(logTS);
    LogToCommandFile(logCmd);
   }

   if (commandName == "reset-aop") {
    teamspeak.channelEdit(config.teamspeak.aopChannel, {
        channelName: "AOP: Not Set"
    });
    // more logs :D
    LogFramework(`AOP RESET by ${username}. Logging to 2 files`);

    const logFW = `${timestamp} - ${username} reset the AOP to "Not Set" [Changing AOP on Framework: core_framework]`;
    const logTs = `${timestamp} - ${username} reset the AOP to "Not Set" [Changing TS3 Channel Name]`;
    const logCmd = `${timestamp} - ${username} used /reset-aop`;
    
    LogToTeamSpeakFile(logTs);
    LogToFrameworkFile(logFW);
    LogToCommandFile(logCmd);
    
    interaction.reply({ content: `AOP reset`, ephemeral: true});
   }

   if (commandName == "info") {
    const infoEmbed = new EmbedBuilder()
    .setColor('DarkAqua')
    .setTimestamp()
    .setThumbnail(config.logo.bprp)
    .setFooter({ text: "BPRP Development Team", iconURL: config.logo.dev})
    .setTitle("Beach Point Roleplay General Information")
    .addFields
    ({
        name: "Main TeamSpeak IP",
        value: "ts.beachpointrp.com"
    },
    {
        name: "Interview TeamSpeak",
        value: "interview.beachpointrp.com"
    },
    {
        name: "Patrol Server",
        value: "server1.beachpointrp.com"
    },
    {
        name: "Website",
        value: "https://beachpointrp.com"
    },
    {
        name: "Sonoran Radio DISCLAIMER:",
        value: "*SAPR (San Andreas Police Radio) Must be uninstalled in order for Sonoran R adio to work.*"
    });

    const infoRow = new ActionRowBuilder()
    .addComponents
    (
    new ButtonBuilder()
    .setLabel("Rules and Regulations")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.rr),
    
    new ButtonBuilder()
    .setLabel("Penal Code")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.pc),
    
    new ButtonBuilder()
    .setLabel("LSPD Discord")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.lspd),

    new ButtonBuilder() 
    .setLabel("SASP Discord")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.sasp));

    const infoRow2 = new ActionRowBuilder()
    .addComponents
    (
    new ButtonBuilder()
    .setLabel("Fire Discord")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.fire),

    new ButtonBuilder()
    .setLabel("Communications Discord")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.comms),

    new ButtonBuilder()
    .setLabel("Civilian Discord")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.civ),
    
    new ButtonBuilder()
    .setLabel("Sonoran Radio")
    .setStyle(ButtonStyle.Link)
    .setURL(config.links.radio));

    interaction.reply({ content: "this doesn't matter so click off of this :/", ephemeral: true });
    interaction.channel.send({ embeds: [infoEmbed], components: [infoRow, infoRow2] });

    const logCmd = `${timestamp} - ${username} used /info`
    LogToCommandFile(logCmd);
   }
   
   if (commandName == "ban") {
    const targetedClient = options.getUser('ban-user');

    const buttonConfirmBan = new ButtonBuilder()
    .setCustomId("confirmBanButton")
    .setStyle(ButtonStyle.Success)
    .setLabel("Confirm");

    const buttonCancelBan = new ButtonBuilder()
    .setCustomId("cancelBanButton")
    .setStyle(ButtonStyle.Danger)
    .setLabel("Cancel");

    const banRow = new ActionRowBuilder()
    .addComponents(buttonCancelBan, buttonConfirmBan); 

    await interaction.reply({ 
    content: `Are you sure you want to ban ${targetedClient.username}?`, components: [banRow], ephemeral: true});
   }

   if (commandName == "patrol-alert") {
    const dateOfPatrol = options.getString("date");
    const everyone = interaction.guild.roles.everyone;
    
    const embedPatrolAlert = new EmbedBuilder()
    .setTitle(`${dateOfPatrol} | **BPRP - Roleplay Session Start Time Vote:**`)
    .setDescription("*to add reaction, click on reaction and type one, " + 
    "three, six, or nine spelled out in order for the emoji to pop up!*")
    .setThumbnail("https://media.discordapp.net/attachments/1116557870910148639/1116559400308584448/beachpointlogo.png?width=1338&height=1004")
    .setTimestamp()
    .setColor('DarkRed')
    .setFooter({
    text: "BPRP Development Team", 
    iconURL: "https://media.discordapp.net/attachments/1116557870910148639/1116559638121418782/BPRP_DEV.png?width=1002&height=1004"
    })
    .addFields
    ({
        name: "Times:",
        value: `1-3PM EST - ${emoji[1]}\n3-5PM EST - ${emoji[3]}\n6-8PM EST - ${emoji[6]}\n9-10PM EST - ${emoji[9]}`
    });
    await interaction.reply({ content: `@everyone`, embeds: [embedPatrolAlert], allowedMentions: everyone});
    const message = await interaction.fetchReply();

    message.react(`${emoji[1]}`);
    message.react(`${emoji[3]}`);
    message.react(`${emoji[6]}`);
    message.react(`${emoji[9]}`);

    const log = `${timestamp} - ${username} use`;
    LogToCommandFile(log);
   }

   if (commandName == "server-restart") {
    
   }

   if (commandName == "restart-bot") {
    await interaction.reply({ content: "Bot is being restarted", ephemeral: true });
    Debug(`${username} is restarting the bot.`);

    await process.exit();
   }

   if (commandName == "server-info") {
    
   }

   if (commandName == "client-info") {
    const memberSearch = options.getMember('member-search');
    const convertToName = memberSearch.displayName;

    const embedClientInfo = new EmbedBuilder()
    .setTitle(`${convertToName}'s BPRP Information`)
    .setTimestamp()
    .setColor('Navy')
    .setFooter({ text: "BPRP Development Team", iconURL: config.logo.dev })
    .addFields
    ({
        name: "Website ID:",
        value: `test`
    });
    interaction.reply({ embeds: [embedClientInfo] });
   }

   if (commandName == "bot-info") {
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    let ping = `${Date.now() - client.ws.ping - interaction.createdTimestamp}ms`

    const embedBotInfo = new EmbedBuilder()
    .setColor('Aqua')
    .setTitle("BPRP Discord Bot")
    .setFooter({text: "BPRP Development Team", iconURL: config.logo.dev })
    .addFields({
        name: "Latency (Ping) 🏓",
        value: `${ping} ms`,
        inline: true
    },
    {
        name: "Bot Uptime",
        value: `\`\`\`${uptime}\`\`\``,
        inline: false
    },
    {
        name: "Bot ID",
        value: `${config.bot.clientId}`,
        inline: true
    },
    {
        name: "Secret",
        value: `${config.bot.clientSecret}`,
        inline: true
    })
    .setTimestamp();
    await interaction.reply({ embeds: [embedBotInfo] });
   }

   if (commandName == "rename-ts-channel") {
    const channelId = options.getInteger('channel-id');
    const channelNameString = options.getString('rename-channel');

    teamspeak.channelEdit(channelId, {
        channelName: channelNameString
    });
    interaction.reply({ content: `Successfully changed channel to: ${channelNameString}!`})
    LogTeamSpeak(`${username} Changed channel teamspeak channel: ${channelId} to "${channelNameString}". logging.`);
    
    const logTs = `${timestamp} - ${username} Changed TeamSpeak Channel: ${channelId} to ${channelNameString}`;
    const logCmd = `${timestamp} - ${username} used /rename-ts-channel`;
    
    LogToTeamSpeakFile(logTs);
    LogToCommandFile(logCmd);
   }

   if (commandName == "purge") {
    const purgeAmount = options.getInteger('purge-amount');
    
    if (purgeAmount > 1000 || purgeAmount < 1) return interaction.reply({ content: "Please input a number that is **between** 1000 and 1", ephemeral: true });
    if (!purgeAmount) return interaction.reply({ content: "Please specify the amount of messages you want to delete.", ephemeral: true });

    interaction.channel.messages.delete(purgeAmount);
   }
   
    //#region Other Events :/
    client.on('guildMemberAdd', async member => {
        const roleIdMain = "";
        const roleIdDev = "";
        const roleIdStaff = "";
        const roleIdSasp = "";
        const roleIdLspd = "";
        const roleIdLsfd = "";
        const roleIdSacd = "";
        const roleIdCiv = "";

    });
    
    client.on('interactionCreate', async buttonInteraction => {
        if (!buttonInteraction.isButton()) return;

        const { customId } = buttonInteraction;
        const targetedClient = options.getUser('ban-user');
        const reason = options.getUser("ban-reason");

        async function reply() {
            buttonInteraction.reply({ content: `Okidokie, Just banned ${targetedClient} for ${reason}.`, ephemeral: true})
        }

        if (customId == "confirmBanButton") {
            buttonInteraction.reply({ content:`Okiedokie, Just banned ${targetedClient} from all assets... Enjoy doing paperwork :P`,
            ephemeral: true })
            .then(message => message.delete({ setTimeout: 5000 })); // 5 Seconds

            buttonInteraction.member.ban(targetedClient);
            await reply();
            teamspeak.logAdd(`${tsId} was banned for ${reason} banned was issued by ${buttonInteraction.user.username}`);
            teamspeak.ban({ uid: tsId });
            Log(`${targetedClient} issued a ban on ${targetedClient}`);
        }
        else if (customId == "cancelBanButton") {
            await buttonInteraction.reply({ content: "The ban was cancelled. Just like your twitter account", ephemeral: true });
            Log(`${interaction.user} attempted to ban ${targetedClient} however the ban was cancelled.`);
        }
    });
});
// Attempt to connect to bot
try {
    client.login(config.bot.token);
} catch(err) {
    console.error(err);
}
