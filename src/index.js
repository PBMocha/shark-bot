// require('dotenv').config();

// const Discord = require('discord.js');
// const ytdl = require('ytdl-core');
// const client = new Discord.Client();
// const sauce = ['karaoke', 'baka mitai', 'fly me to the moon'];

// client.on('ready', () => {
//     console.log('Sharrrrrk -gawr gura');
// });

// client.on('message', (msg) => {
    
//     if (msg.content === '!shrimp') 
//         msg.channel.send('-p gawr gura baka mitai');
// })

// client.login(process.env.D_TOKEN);

const Discord = require("discord.js");
require('dotenv').config();
const prefix = '!';
const token = process.env.D_TOKEN;

const ytdl = require("ytdl-core");

const client = new Discord.Client();

const queue = new Map();

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

  if (message.content.startsWith(`${prefix}shrimp`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}bonk`)) {
    message.channel.send('https://tenor.com/bpvlz.gif');
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  // const args = message.content.split(" ");
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

  const songs = [
    {
      song: {
        title: 'Ride On Time',
        url: 'https://www.youtube.com/watch?v=NcOLcQJmm5M'
      },
    },
    {
      song: {
        title: 'Koi',
        url: 'https://www.youtube.com/watch?v=FDC6rfdnjIM'
      },
    },
    {
      song: {
        title: 'Ke Sera Sera',
        url: 'https://www.youtube.com/watch?v=riY11Uh9wH0'
      },
    },
    {
      song: {
        title: 'Judgement',
        url: 'https://www.youtube.com/watch?v=UiMgeKJMV2U'
      },
    },
    {
      song: {
        title: 'Fly Me To The Moon',
        url: 'https://www.youtube.com/watch?v=82T8yOG5MTk'
      },
    },
    {
      song: {
        title: 'Bloody Stream',
        url: 'https://www.youtube.com/watch?v=kBDp7CPhxy0'
      },
    },
    {
      song: {
        title: 'Baka Mitai',
        url: 'https://www.youtube.com/watch?v=TY-Bi6sveqg'
      },
    },
    {
      song: {
        title: 'Gurenge',
        url: 'https://www.youtube.com/watch?v=K1LjCn6pRxA'
      },
    },
    {
      song: {
        title: 'Promise of the World',
        url: 'https://www.youtube.com/watch?v=iv4ZKKahi0Q'
      },
    },
    {
      song: {
        title: 'Dragon Night',
        url: 'https://www.youtube.com/watch?v=jsmXFiG-e1I'
      },
    },
    {
      song: {
        title: 'Departure',
        url: 'https://www.youtube.com/watch?v=A_JzopQT4JU'
      },
    },
    {
      song: {
        title: 'Odoroyo Fish',
        url: 'https://www.youtube.com/watch?v=1lWSaWDE9m8'
      },
    },
    { 
      song: {
        title: 'Mousou Express',
        url: 'https://www.youtube.com/watch?v=cpEo35Ia0z8'
      },
    },
    {
      song: {
        title: 'Chiisana Boukensha',
        url: 'https://www.youtube.com/watch?v=Qr-XDcL8IaE'
      },
    },
    {
      song: {
        title: 'A Cruel Angel\'s Thesis',
        url: 'https://www.youtube.com/watch?v=xpGTZWkEFKc'
      },
    }

  ]
  // const songInfo = await ytdl.getInfo(args[1]);

  const random = Math.floor(Math.random() * songs.length);
  const song = songs[random].song;
  // const song = {
  //   title: 'Baka Mitai',
  //   url: 'https://www.youtube.com/watch?v=Pt7KbDvUwmQ'
  // };
  // console.log("Song")
  // console.log(song)

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
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login(token);
