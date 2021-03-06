require("dotenv").config();
const token = process.env.token;
const mongoPath = process.env.mongoPath;
const mongoose = require("mongoose");
const nekoyasui = require("nekoyasui");
const youtube = process.env.youtube;
const botname = process.env.botname;
const colors = require('colors');
const logger = require('./logger')
const ownerID = process.env.ownerid;
const SpotifyPlugin = require("@distube/spotify");
const {format} = require('./functions2')
const counterSchema = require("./schemas/count");
const key1 = process.env.key1;
const Discord = require("discord.js");
const path = require("path");
const starboardSchema = require("./schemas/starboard");
const modlogsSchema = require("./schemas/modlogs");
const voiceSchema = require("./schemas/customvoice");
const client = new Discord.Client({
    partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER", "REACTION"],
});
const fs = require("fs");
const { GiveawaysManager } = require("discord-giveaways");
const afk = new Discord.Collection();
const moment = require("moment");
const Levels = require("discord-xp");
const glob = require("glob");

Levels.setURL(mongoPath);

const search = require("youtube-search");
const DisTube = require("distube");
const music = new DisTube(client,  { searchSongs: 0,
    emitNewSongOnly: false,
    highWaterMark: 1024*1024*64,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: true,
    plugins: [new SpotifyPlugin({ parallel: true })],
    // youtubeCookie --> prevents ERRORCODE: "429"
    youtubeDL: true,
    updateYouTubeDL: true, });
const { MessageAttachment } = require("discord.js");
const { getPokemon } = require("./commands/fun/pokemon");
client.snipes = new Map();
const canvas = require("discord-canvas");
const Schema = require("./schemas/welcomeChannel");
const guildSchema = require("./schemas/Guilds");
const reactionSchema = require("./schemas/reaction-roles");
const ms = require("ms");
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client, {
    token: token
});
const disbut = require('discord-buttons')(client);
const countSchema = require("./schemas/member-count");
const blacklistserver = require("./schemas/blacklist-server")
const inviteschema = require("./schemas/anti-invite")
const antijoin = new Discord.Collection();
const blacklistedWords = new Discord.Collection();
const { chatBot } = require("reconlx");
const chatschema = require("./schemas/chatbot-channel");
const blacklistSchema = require("./schemas/blacklist");
const starboardcollection = new Discord.Collection();

module.exports = { antijoin, blacklistedWords, afk, starboardcollection };

const status = (queue) =>
    `Volume: \`${queue.volume}%\` | Loop: \`${
        queue.repeatMode ? (queue.repeatMode == 2 ? "Server Queue" : "This Song") : "Off"
    }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
music
    .on("connect", (queue) => {
        queue.textChannel.send(`Connected to ${queue.voiceChannel}`)
    })
    .on("disconnect", (queue) => {
        queue.textChannel.send(`Disconnected from ${queue.voiceChannel}`)
    })
    .on("playSong", (queue, song) => {
        const embed = new Discord.MessageEmbed()
            .setDescription(
                `Playing: :notes: [${song.name}](${song.url}) - \`${song.formattedDuration}\`\n${status(
                    queue
                )}`
            )
            .setColor("RANDOM")
            .setThumbnail(song.thumbnail);
        queue.textChannel.send(embed);
    })
    .on("addSong", (queue, song) => {
        const embed = new Discord.MessageEmbed()
            .setDescription(
                    `Added: [${song.name}](${song.url}) - \`${song.formattedDuration}\`\n${status(
                            queue
                )} to the queue`
             )
            .setColor("RANDOM")
            .setThumbnail(song.thumbnail);
        queue.textChannel.send(embed);
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send(
            `Added \`${playlist.name}\` playlist (${
                playlist.songs.length
            } songs) to queue\n${status(queue)}`
        );
    })
    .on("playList", (queue, playlist) => {
        const embed = new Discord.MessageEmbed()
            .setDescription(
                `Play \`${playlist.name}\` playlist (${
                    playlist.songs.length
                } 
                }\`\n${status(queue)}`
            )
            .setColor("RANDOM")
            .setThumbnail(song.thumbnail);
        queue.textChannel.send(embed);
    })
    .on("initQueue", (queue) => {
        queue.autoplay = false;
        queue.volume = 100;
    })
    .on("empty", (queue) => {
        (queue.textChannel.send("Channel is empty. Leaving the channel"))
    })
    .on("error", (channel, error) => {
        channel.send(`An error has occured ${error}`);
    });
client.music = music;

const opts = {
    maxResults: 25,
    key: youtube,
    type: "video",
};

client.commands = new Discord.Collection();
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "./giveaways.json",
    updateCountdownEvery: 5000,
    default: {
        botsCanWin: false,
        exemptPermission: ["MANAGE_MESSAGES", "ADMINSTRATOR"],
        embedColor: "RANDOM",
        reaction: "🎁",
    },
});

function embedbuilder(client, message, color, title, description) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setFooter(client.user.username, client.user.displayAvatarURL());
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return message.channel.send(embed);
}

client.on("ready", async () => {
    console.log(botname);
    console.log("Heroku Connected");


    await mongoose
        .connect(mongoPath, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        .then(console.log("Connected to Mongo"));

    blacklistSchema.find().then((data) => {
        data.forEach((val) => {
            blacklistedWords.set(val.Guild, val.Words);
        });
    });
    setInterval(() => {
        countSchema.find().then((data) => {
            if (!data && !data.length) return;
            data.forEach((value) => {
                const guild = client.guilds.cache.get(value.Guild);
                const memberCount = guild.memberCount;
                if (value.Member != memberCount) {
                    console.log("Member count differs");
                    const channel = guild.channels.cache.get(value.Channel);

                    channel.setName(`Members: ${memberCount}`);

                    value.Member = memberCount;
                    value.save();
                }
            });
        });
    }, ms("15 Minutes"));

    const arrayOfStatus = [
        `${client.guilds.cache.size} servers`,
        `${client.channels.cache.size} channels`,
        `${client.users.cache.size} users`,
        `run !necro`,
    ];

    let index = 0;
    setInterval(() => {
        if (index == arrayOfStatus.length) index = 0;
        const status = arrayOfStatus[index];
        client.user.setActivity(status);
        index++;
    }, 5000);
});


client.once("disconnect", () => {
    console.log("Disconnect");
});



client.on("message", async (message) => {
    if (!message.guild || message.author.bot) {
        return;
    }

    function Check(str) {
        if (
            client.emojis.cache.find((emoji) => emoji.name === str) ||
            message.guild.emojis.cache.find((emoji) => emoji.name === str)
        ) {
            return true;
        } else {
            return false;
        }
    }
    if (message.content.startsWith(":") && message.content.endsWith(":")) {
        let EmojiName = message.content.slice(1, -1);

        if (Check(EmojiName) === true) {
            const channel = client.channels.cache.get(message.channel.id);
            try {
                let webhooks = await channel.fetchWebhooks();
                let webhook = webhooks.first();
                if (webhook === undefined || null || !webhook) {
                    let Created = channel
                        .createWebhook("Bloxiphy", {
                            avatar:
                                "https://cdn.discordapp.com/avatars/708580906880860171/a_229b573176f79643d7fa5f6f7d8aed63.gif?size=256",
                        })
                        .then(async (webhook) => {
                            const emoji =
                                client.emojis.cache.find((e) => e.name == EmojiName).id ||
                                message.guild.emojis.cache.find((e) => e.name === EmojiName).id;

                            await webhook.send(`${client.emojis.cache.get(emoji)}`, {
                                username: message.author.username,
                                avatarURL: message.author.avatarURL({ dynamic: true }),
                            });
                            message.delete();
                        });
                }

                const emoji =
                    client.emojis.cache.find((e) => e.name == EmojiName).id ||
                    message.guild.emojis.cache.find((e) => e.name === EmojiName).id;

                await webhook.send(`${client.emojis.cache.get(emoji)}`, {
                    username: message.author.username,
                    avatarURL: message.author.avatarURL({ dynamic: true }),
                });
                message.delete();
            } catch (error) {
                console.log(`Error :\n${error}`);
            }
        }
    }

    const randomXP = Math.floor(Math.random() * 29) + 1;
    const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXP);

    await inviteschema.findOne({Server: message.guild.id}, async(err, data) => {
        if(!data) return;
        if(data.Server === message.guild.id){
            
            const InviteLinks = ['discord.gg/','discord.com/invite/','discordapp.com/invite/']
    
            if(InviteLinks.some(link => message.content.toLowerCase().includes(link))){
                const UserCode = message.content.split('discord.gg/' || 'discord.com/invite/' || 'discordapp.com/invite/')[1]
                message.guild.fetchInvites().then(invites => {
                    let InviteArray = []
                    for(let inviteCode of invites){
                        InviteArray.push(inviteCode[0])
    
                    }
                    if(!InviteArray.includes(UserCode)){
                        message.delete()
                        return message.channel.send("Please do not send links to other servers")
                    }
                })
            }
        }
    })

    const splittedMsgs = message.content.split(" ");

    let deleting = false;

    await Promise.all(
        splittedMsgs.map((content) => {
            if (blacklistedWords.get(message.guild.id)?.includes(content.toLowerCase()))
                deleting = true;
        })
    );

    if (deleting) return message.delete();

    await counterSchema.findOne({ Guild: message.guild.id }, async (err, data) => {
        if(data == null) return;
        if (message.channel.id !== data.Channel) return;

        let number = parseInt(message.content);
        let current = parseInt(data.Count);
        if (!isNaN(number)) {
            if (message.author.id == data.UserID) {
                data.Count = 0;
                await data.save();
                message.react("❌");
                data.UserID = null;
                await data.save();
                return message.channel.send(
                    `${message.author.username} has messed it up, stopped at ${
                        number - 1
                    } ,resetting game to start at 1`
                );
            } else {
                if (number == current + 1) {
                    data.Count = data.Count + 1;
                    data.UserID = message.author.id;
                    await data.save();
                    message.react("✅");
                } else {
                    data.Count = 0;
                    data.UserID = null;
                    await data.save();
                    message.react("❌");
                    message.channel.send(
                        `${message.author.username} has messed it up, stopped at ${current} ,resetting game to start at 1`
                    );
                }
            }
        }
    });

    await chatschema.findOne({ Guild: message.guild.id }, async (err, data) => {
        if (!data) return;

        if (message.channel.id !== data.Channel) return;

        const master = await nekoyasui.search.user(message, ownerID);
        const channel = await nekoyasui.search.channel(message, data.Channel);
        if (!channel) return;
        if (!master) console.log("Oh! noooooo.. where r u master!");
        const bot = {
            name: message.client.user.username,
            birthdate: "10/24/2001",
            prefix: message.client.prefix,
            gender: "Genderless",
            description: "Omnipotent Bot",
            country: "Latveria",
            city: "Doomstadt",
        };
        const owner = {
            id: master.id,
            username: master.username,
            discriminator: master.discriminator,
            invite: "",
        };
        const res = await nekoyasui.chat(String(message.content), message.author.id, bot, owner);
        channel.send(res.cnt);
    });

    const mentionedMember = message.mentions.members.first();

    if (mentionedMember) {
        const data = afk.get(mentionedMember.id);

        if (data) {
            await message.delete();
            const [timestamp, reason] = data;
            const timeAgo = moment(timestamp).fromNow();

            message.channel.send(
                `${mentionedMember.user.username} is currently afk (${timeAgo})\nReason: ${reason}`
            );
        }
    }

    const getData = afk.get(message.author.id);
    if (getData) {
        afk.delete(message.author.id);
        message.channel.send(`${message.member} afk has been removed`);
    }

    const settings = await guildSchema.findOne(
        {
            guildID: message.guild.id,
        },
        (err, guild) => {
            if (err) console.error(err);
            if (!guild) {
                const newGuild = new guildSchema({
                    _id: mongoose.Types.ObjectId(),
                    guildID: message.guild.id,
                    guildName: message.guild.name,
                    prefix: process.env.prefix,
                });

                newGuild
                    .save()
                    .then((result) => console.log(result))
                    .catch((err) => console.error(err));

                return message.channel
                    .send(
                        "This server was not in our database! We have now added and you should be able to use bot commands."
                    )
                    .then((m) => m.delete({ timeout: 10000 }));
            }
        }
    );

    const prefix = settings.prefix;

    if (!message.content.startsWith(prefix)) return;

    if (message.content.toLowerCase() == "!necroytsearch") {
        let embed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setDescription("Please enter a search query. Please narrow your search")
            .setTitle("Youtube Search API");

        let embedMsg = await message.channel.send(embed);
        let filter = (m) => m.author.id === message.author.id;
        let query = await message.channel.awaitMessages(filter, { max: 1 });
        console.log(query);
        let results = await search(query.first().content, opts).catch((err) => console.log(err));
        if (results) {
            let youtubeResults = results.results;
            let i = 0;
            let titles = youtubeResults.map((result) => {
                i++;
                return i + ") " + result.title;
            });

            console.log(titles);
            message.channel
                .send({
                    embed: {
                        title: "Select which video you want by typing the number",
                        description: titles.join("\n"),
                    },
                })
                .catch((err) => console.log(err));

            filter = (m) =>
                m.author.id === message.author.id &&
                m.content >= 1 &&
                m.content <= youtubeResults.length;
            let collected = await message.channel.awaitMessages(filter, { max: 1 });
            let selected = youtubeResults[collected.first().content - 1];

            embed = new Discord.MessageEmbed()
                .setTitle(`${selected.title}`)
                .setURL(`${selected.link}`)
                .setDescription(`${selected.description}`)
                .setThumbnail(`${selected.thumbnails.default.url}`);

            message.channel.send(embed);
        }
    }


    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    var getDirectories = function (src, callback) {
        glob(src + '/**/*', callback);
    };
    getDirectories('./commands', async function (err, res) {
    if (err) {
        console.log(err);
    } else {
        var commandFiles = [];
        commandFiles = res.filter((v, i) => v.endsWith(".js"));
        for (const file of commandFiles) {
            const command = require(file);
            client.commands.set(command.name, command);
        }
        if (!client.commands.has(command)) {
            return;
        }
        try {
            client.commands.get(command).execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply("Issue loading command");
        }

        if (command) {
            const blacklisted = await blacklistserver.findOne({Server: message.guild.id})

            if(blacklisted) return message.channel.send("Cannot use commands as owner has blacklisted this server")
            const channel = client.channels.cache.get("800421170301501470");

            channel.send(
                `**${message.author.tag}** has used ${command} command in **${message.guild.name}**`
            );
        }
    }
    });

});

client.on("guildMemberAdd", async (member) => {
    Schema.findOne({ Guild: member.guild.id }, async (e, data) => {
        if (!data) return;
        const user = member.user;
        const image = await new canvas.Welcome()
            .setUsername(user.username)
            .setDiscriminator(user.discriminator)
            .setMemberCount(member.guild.memberCount)
            .setGuildName(member.guild.name)
            .setAvatar(user.displayAvatarURL({format: 'png'}))
            .setColor("border", "#08D9FB")
            .setColor("username-box", "#2063E9")
            .setColor("discriminator-box", "#2063E9")
            .setColor("message-box", "#2063E9")
            .setColor("title", "#2063E9")
            .setColor("avatar", "#2063E9")
            .setBackground("./background.jpg")
            .toAttachment();
 
    const attachment = new Discord.MessageAttachment(await image.toBuffer(), "goodbye-image.png");
    const channel = member.guild.channels.cache.get(data.Channel); 
 
    channel.send(attachment);

    });

    const getCollection = antijoin.get(member.guild.id);
    if (!getCollection) return;
    if (!getCollection.includes(member.user)) {
        getCollection.push(member.user);
    }
    member.kick({ reason: "Antijoin was enabled" });
});

client.on("messageDelete", async (message) => {
    client.snipes.set(message.channel.id, {
        content: message.content,
        author: message.author,
    });

    if (!message.partial) {
        const channel = client.channels.cache.get("807398780160573501");

        if (channel) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Deleted Message")
                .addField("Author", `${message.author.tag} (${message.author.id})`)
                .addField("Channel", `${message.channel.name} (${message.channel.id})`)
                .setDescription(message.content)
                .setTimestamp();
            channel.send(embed);
        }
    }
});

const voiceCollection = new Discord.Collection();

client.on("voiceStateUpdate", async (oldState, newState) => {
    const user = await client.users.fetch(newState.id);
    const member = newState.guild.member(user);
    await voiceSchema.findOne({ Guild: oldState.guild.id }, async (e, data) => {
        if(data == null) return;
        if (!oldState.channel && newState.channel.id === data.Channel) {
            const channel = await newState.guild.channels.create(user.tag, {
                type: "voice",
                parent: newState.channel.parent,
            });
            member.voice.setChannel(channel);
            voiceCollection.set(user.id, channel.id);
        } else if (!newState.channel) {
            if (oldState.channelID === voiceCollection.get(newState.id)) {
                return oldState.channel.delete();
            }
        }
    });
});

client.on("messageReactionAdd", async (reaction, user) => {
    const handleStarboard = async () => {
        starboardSchema.findOne({ Guild: reaction.message.guild.id }, async (err, data) => {
            if(data == null) return;
            const starboardchannel = data.Channel;
            const starboard = client.channels.cache.get(starboardchannel);
            const msgs = await starboard.messages.fetch({ limit: 100 });
            const existingMsg = msgs.find((msg) =>
                msg.embeds.length === 1
                    ? msg.embeds[0].footer.text.startsWith(reaction.message.id)
                        ? true
                        : false
                    : false
            );
            if (existingMsg)
                existingMsg.edit(`${reaction.count} - ⭐ | ${reaction.message.channel}`);
            else {
                const embed = new Discord.MessageEmbed()
                    .setAuthor(
                        reaction.message.author.tag,
                        reaction.message.author.displayAvatarURL()
                    )
                    .setDescription(
                        `**[Jump to this message](${reaction.message.url})**\n\n${
                            reaction.message.content || ""
                        }\n`
                    )
                    .setFooter(
                        reaction.message.id + " - " + new Date(reaction.message.createdTimestamp)
                    );

                if (reaction.message.attachments.array().length > 0) {
                    embed.setImage(reaction.message.attachments.first().url);
                }

                if (starboard) starboard.send(`1 - ⭐ | ${reaction.message.channel}`, embed);
            }
        });
    };
    if (reaction.emoji.name === "⭐") {
        starboardSchema.findOne({ Guild: reaction.message.guild.id }, async (err, data) => {
           if(data == null) return;
            const starboardchannel = data.Channel;
            const starboard = client.channels.cache.get(starboardchannel);

            if (reaction.message.channel.id == starboard.id) return;
            if (reaction.message.partial) {
                await reaction.fetch();
                await reaction.message.fetch();
                handleStarboard();
            } else handleStarboard();
        });
    }

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    reactionSchema.findOne({ Message: reaction.message.id }, async (err, data) => {
        if (!data) return;
        if (!Object.keys(data.Roles).includes(reaction.emoji.name)) return;

        const [roleid] = data.Roles[reaction.emoji.name];
        reaction.message.guild.members.cache.get(user.id).roles.add(roleid);
        user.send("You have acquired this role");
    });
});

client.on("messageReactionRemove", async (reaction, user) => {
    const handleStarboard = async () => {
        starboardSchema.findOne({ Guild: reaction.message.guild.id }, async (err, data) => {
          if(data == null) return;
            const starboardchannel = data.Channel;
            const starboard = client.channels.cache.get(starboardchannel);
            const msgs = await starboard.messages.fetch({ limit: 100 });
            const existingMsg = msgs.find((msg) =>
                msg.embeds.length === 1
                    ? msg.embeds[0].footer.text.startsWith(reaction.message.id)
                        ? true
                        : false
                    : false
            );
            if (existingMsg) {
                if (reaction.count === 0) existingMsg.delete({ timeout: 2500 });
                else existingMsg.edit(`${reaction.count} - | ${reaction.message.channel}`);
            }
        });
    };

    if (reaction.emoji.name === "⭐") {
        starboardSchema.findOne({ Guild: reaction.message.guild.id }, async (err, data) => {
          if(data == null) return;
            const starboardchannel = data.Channel;
            const starboard = client.channels.cache.get(starboardchannel);

            if (reaction.message.channel.id == starboard.id) return;
            if (reaction.message.partial) {
                await reaction.fetch();
                await reaction.message.fetch();
                handleStarboard();
            } else handleStarboard();
        });
    }

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;

    reactionSchema.findOne({ Message: reaction.message.id }, async (err, data) => {
        if (!data) return;
        if (!Object.keys(data.Roles).includes(reaction.emoji.name)) return;

        const [roleid] = data.Roles[reaction.emoji.name];
        reaction.message.guild.members.cache.get(user.id).roles.remove(roleid);
        user.send("Role has been removed");
    });
});

logger(client);
client.login(token);
