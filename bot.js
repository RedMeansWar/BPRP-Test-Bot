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
    ActionRowBuilder,
    roleMention,
} = require('discord.js');

const { TeamSpeak } = require('ts3-nodejs-library');
const config = require('./config');
const randomstring = require('randomstring');
const mysql = require('mysql');
const emoji = require('./emoji');

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

const rest = new REST().setToken(config.token);
// rest.delete(Routes.applicationCommand(config.clientId, '1115890965941596220')).then(() => console.log("[BPRP Bot]: Deleted Command"));

// TeamSpeak 3 connection
const teamspeak = new TeamSpeak({
    host: config.ts3Host,
    queryport: 10011,
    serverport: 9987,
    username: config.ts3Name,
    password: config.ts3Pass
});

// Connect to Master DB
const mysqlConnect = mysql.createConnection({
    host: config.dbHost,
    user: config.dbUsername,
    password: config.dbPassword,
    port: config.dbPort,
    timeout: config.timeout
});

// Console output
client.on('ready', () => {
    console.log('[BPRP]: Bot Online');
});

mysqlConnect.connect(function(err) {
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
    // Admin Commands
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
                required: false // I can't get this from a database until I code the API.
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
                description: "the date for the rp to start.",
                type: 3,
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
   var { commandName } = interaction;
   var { options } = interaction;
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
   }

   // This to WAYYY to long to code
   if (commandName == "set-aop") {
    const aopCategory = options.getString('aop');

    teamspeak.channelEdit(124, {
        channelName: `AOP: ${aopCategory}`
    })
    // one console log because why not
    console.log(`[BPRP FRAMEWORK]: AOP Updated to: ${aopCategory}`);

    interaction.reply({ content: `AOP Updated to: ${aopCategory}`, ephemeral: true});
   }

   if (commandName == "reset-aop") {
    teamspeak.channelEdit(271, {
        channelName: "AOP: Not Set"
    })
    // one console log because why not
    console.log(`[BPRP FRAMEWORK]: AOP Reset`);

    interaction.reply({ content: `AOP reset`, ephemeral: true})
   }

   if (commandName == "info") {
    const infoEmbed = new EmbedBuilder()
    .setTitle("Community Information")
    .setColor("Blue")
    .setTimestamp()
    .setThumbnail("https://media.discordapp.net/attachments/1116557870910148639/1116559400308584448/beachpointlogo.png?width=1338&height=1004")
    .addFields
    ({
        name: "Rules & Regulations",
        value: "[Link](https://docs.google.com/document/d/13IE6URM5RSzJZAYt5N4uY0AHPz9to4zougYl-dhLjxg/edit?usp=sharing)",
    },
    {
        name: "Penal Code",
        value: "[Link](https://docs.google.com/document/d/1iswMUtIZ4KpGmD4UShdH4SCN4qrt49oSybPqmI_f7iw/edit?usp=sharing)",
    },
    {
        name: "LSPD Discord",
        value: "[Link](https://discord.gg/vjHvVVMsPY)",
    },
    {
        name: "SASP Discord",
        value: "[Link](https://discord.gg/Yh3Nsja6Kp)",
    },
    {
        name: "Fire Discord",
        value: "[Link](https://discord.gg/dkjAYv3DpN)",
    },
    {
        name: "Communications Discord",
        value: "[Link](https://discord.gg/HXfT7ufyNG)",
    },
    {
        name: "Civilian Discord",
        value: "[Link](https://discord.gg/F2WPzUSGrC)",
    },
    {
        name: "BPRP Main TeamSpeak IP",
        value: "ts.beachpointrp.com"
    },
    {
        name: "BPRP Interview TeamSpeak IP",
        value: "interview.beachpointrp.com"
    },
    {
        name: "Sonoran Radio",
        value: "[Link](https://info.sonoranradio.com/en/tutorials/install-plugin) | **NOTE:** SAPR Must be uninstalled for this to work. "
    })
    .setFooter({ 
    text: "BPRP Development Team", 
    iconURL: "https://media.discordapp.net/attachments/1116557870910148639/1116559638121418782/BPRP_DEV.png?width=1002&height=1004"})

    interaction.reply({ content: "this doesn't matter so click off of this :/", ephemeral: true });
    interaction.channel.send({ embeds: [infoEmbed] });
   }
   
   if (commandName == "ban") {
    const targetedClient = options.getUser('ban-user');
    guild.members.ban(targetedClient);

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

    await interaction.reply({ content: `Are you sure you want to ban ${targetedClient.username}?`, components: [banRow], ephemeral: true})
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
   }
   //#endregion

    //#region Button Inteactions with/without commands
    client.on('interactionCreate', buttonInteraction => {
        if (!buttonInteraction.isButton()) return;
        const { customId } = buttonInteraction;
        const targetedClient = options.getUser('ban-user');

        if (customId == "confirmBanButton") {
            buttonInteraction.reply({ content:`Okiedokie, Just banned ${targetedClient} from all assets... Enjoy doing paperwork :P`,
            ephemeral: true })
            .then(message => message.delete({ setTimeout: 5000 })); // 5 Seconds


            buttonInteraction.member.ban(targetedClient);
        }
        else if (customId == "cancelBanButton") {
            buttonInteraction.reply({ content: `Alright I cancelled the ban... Just how your twitter account got cancelled`, })
            then(message => message.delete({ setTimeout: 5000 })); // 5 Seconds
        }
    });
    //#endregion
});
// Attempt to connect to bot
try {
    client.login(config.token);
} catch(err) {
    console.error(err);
}