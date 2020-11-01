const Discord = require("discord.js");

require('dotenv').config();

const prefix = '~';
const token = process.env.D_TOKEN;

const ytdl = require("ytdl-core");

const client = new Discord.Client();

const queue = new Map();
const songs = require('./songs').songs;
const commandToArtist = require('./songs').artists;

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);
  if (isMessageCommandToPlaySong(message)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}remove`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}bonk`)) {
    message.channel.send('https://tenor.com/bpvlz.gif');
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

const isMessageCommandToPlaySong = (message) => {
  let isMatch = false;
  const artistKeys = Object.keys(commandToArtist);
  for (let i = 0; i < artistKeys.length; i++) {
    if (message.content.startsWith(`${prefix}${artistKeys[i]}`)) {
      isMatch = true;
    }
  }
  return isMatch;
}

async function execute(message, serverQueue) {
  const args = message.content.split(" ");
  let artistCommand = args[0]
  artistCommand = artistCommand.replace(prefix, '')
  const artist = commandToArtist[artistCommand]
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions SHARRRRRKKKK!"
    );
  }

  const random = Math.floor(Math.random() * songs[artist].length);
  const song = songs[artist][random].song;

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 }), {highWaterMark: 1})
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`**Singing** **${song.title}**`);
}

client.login(token);
