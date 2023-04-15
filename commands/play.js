const { useMasterPlayer, useQueue, Track } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const common = require("../components/common");
const { checkLinkType } = require("../components/helper");
const helper = require("../components/helper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from any platform!")
    .addStringOption((option) =>
      option
        .setName("search")
        .setDescription("search keyword")
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = helper.checkLinkType(
      interaction.options._hoistedOptions[0].value
    );
    if (query === "text") {
      common.playYoutubeSong(interaction);
    } else if (query === "youtube") {
      const checkyLink = helper.checkYoutubeLinkType(
        interaction.options._hoistedOptions[0].value
      );
      if (checkyLink === "song") {
        common.playYoutubeSong(interaction);
      } else {
        common.playYoutubePlaylist(interaction);
      }
    } else {
      console.log("spotify link");
      const checkslink = helper.checkSpotifyLinkType(
        interaction.options._hoistedOptions[0].value
      );
      if (checkslink === "song") {
        common.playSpotifySong(interaction);
      } else {
        common.playSpotifyPlaylist(interaction);
      }
    }
  },
};

// function isValidLink(str) {
//   const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
//   return pattern.test(str);
// }

// let embed = null;
// let embedObj = null;

// try {
//   if (isValidLink(searchTerms)) {
//     await queue.join(interaction.member.voice.channel);
//     queue.play(searchTerms);
//     embedObj = searchTerms;
//   } else {
//     const video = await play.search(searchTerms, { limit: 1 });
//     if (!video[0])
//       return await interaction.editReply(
//         "Sorry, I couldn't find that song!"
//       );

//     const stream = await play.stream(video[0].url);
//     await queue.join(interaction.member.voice.channel);
//     queue.play(stream.video_url);

//     embed = new EmbedBuilder()
//       .setColor(0x23272a)
//       .setTitle(video[0].title)
//       .setURL(video[0].url)
//       .setDescription(video[0].description);
//     embedObj = {
//       ephemeral: true,
//       embeds: [embed],
//     };
//   }
// } catch (e) {
//   console.log(e);
// }

// const message = await interaction.editReply(embedObj).then(async (msg) => {
//   await msg
//     .react("⏸")
//     .then(async () => {
//       await msg.react("⏹");
//       await msg.react("⏩");
//       await msg.react("🔂");
//       await msg.react("🔁");
//       await msg.react("❌");
//     })
//     .then(async () => {
//       const filter = (reaction, user) => {
//         return (
//           ["⏸", "⏹", "⏩", "🔂", "🔁", "❌"].includes(
//             reaction.emoji.name
//           ) && user.id ==== message.author.id
//         );
//       };

//       const collector = await msg.createReactionCollector(filter);

//       let paused = false;
//       let loop = false;
//       let loopQueue = false;

//       collector.on("collect", async (reaction, user) => {
//         let reactionName = await reaction.emoji.name;

//         switch (reactionName) {
//           case "⏸":
//             if (!paused) {
//               if (!queue)
//                 return interaction.followUp(
//                   "There is no song in the queue to be paused!"
//                 );
//               await queue.setPaused(true);
//               await interaction.followUp("song pasued");
//               paused = true;
//             } else {
//               await queue.setPaused(false);
//               await interaction.followUp("Playing!");
//               paused = false;
//             }
//             break;
//           case "⏹":
//             if (!queue)
//               return interaction.followUp(
//                 "There is no song in the queue to be stopped!"
//               );
//             await queue.stop();
//             await interaction.followUp("Stopped playing!");
//             break;
//           case "⏩":
//             if (!queue)
//               return interaction.followUp(
//                 "There is no song in the queue to be skipped!"
//               );
//             await queue.skip();
//             await interaction.followUp("Skipped current song!");
//             break;
//           case "🔂":
//             if (!loop) {
//               if (!queue)
//                 return interaction.followUp(
//                   "There is no song in the queue to be looped!"
//                 );
//               await queue.setRepeatMode(RepeatMode.SONG);
//               await interaction.followUp(
//                 "Loop mode for current song is On"
//               );
//               loop = true;
//             } else {
//               await queue.setRepeatMode(RepeatMode.DISABLED);
//               await interaction.followUp("Loop mode is off");
//               loop = false;
//             }
//             break;
//           case "🔁":
//             if (!queue)
//               return interaction.followUp(
//                 "There is no queue to be looped!"
//               );
//             if (!loopQueue) {
//               await queue.setRepeatMode(RepeatMode.QUEUE);
//               await interaction.followUp(
//                 "Loop mode for current queue is On"
//               );
//               loopQueue = true;
//             } else {
//               await queue.setRepeatMode(RepeatMode.DISABLED);
//               await interaction.followUp("Loop mode is off");
//               loopQueue = false;
//             }
//             break;
//           case "❌":
//             await interaction.guild.members.me.voice.disconnect()
//             await interaction.followUp("Disconnected");
//             break;
//           default:
//             await interaction.followUp("Playing!");
//         }

//         await reaction.users.remove(user.id);
//         console.log(queue.guild.channels.voiceStates);
//       });
//     })
//     .catch((e) => console.log(e));
// });
