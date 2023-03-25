const { useMasterPlayer, useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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
  async execute(client, interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    const player = useMasterPlayer();
    const channel = interaction.member.voice.channel;

    let queue = player.nodes.create(interaction.guild.id, {
      metadata: {
        channel: interaction.channel,
        client: interaction.guild.members.me,
        requestedBy: interaction.user,
      },
      selfDeaf: true,
      leaveOnEmpty: false,
      leaveOnEnd: false,
      leaveOnStop: false,
    });

    let query = interaction.options.getString("search");

    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: "auto",
    });

    if (!result.hasTracks()) {
      await interaction.editReply(`We found no tracks for ${query}!`);
      return;
    } else {
      try {
        await player.play(channel, result, {
          nodeOptions: {
            metadata: interaction,
          },
        });
        const tracks = result.tracks;

        const embed = new EmbedBuilder();

        if (queue.getSize() < 1) {
          embed
            .setTitle(tracks[0].raw.title)
            .setDescription(tracks[0].raw.description)
            .setColor("#FFFFFF");
        } else {
          const fields = tracks.map((track, index) => ({
            name: `${index + 1}. ${track.title}`,
            value: `Duration: ${track.duration}`,
            inline: false,
          }));

          const maxFieldsPerEmbed = 25;
          const numOfEmbeds = Math.ceil(fields.length / maxFieldsPerEmbed);

          for (let i = 0; i < numOfEmbeds; i++) {
            const start = i * maxFieldsPerEmbed;
            const end = start + maxFieldsPerEmbed;

            const embedFields = fields.slice(start, end);

            embed
              .setTitle("Playlist")
              .setDescription("Here is my playlist:")
              .setColor("#FFFFFF");

            embed.addFields(embedFields.slice(start, end));
          }
        }
        const message = await interaction
          .editReply({ embeds: [embed] })
          .then(async (msg) => {
            await msg
              .react("⏪")
              .then(async () => {
                await msg.react("⏸");
                await msg.react("⏹");
                await msg.react("⏩");
                await msg.react("🔂");
                await msg.react("🔁");
                await msg.react("❌");
              })
              .then(async () => {
                const filter = (reaction, user) => {
                  return (
                    ["⏪", "⏸", "⏹", "⏩", "🔂", "🔁", "❌"].includes(
                      reaction.emoji.name
                    ) && user.id === message.author.id
                  );
                };

                const collector = await msg.createReactionCollector(filter);

                let paused = false;
                let loop = false;
                let loopQueue = false;

                collector.on("collect", async (reaction, user) => {
                  let reactionName = await reaction.emoji.name;

                  switch (reactionName) {
                    case "⏪":
                      queue.history.back();
                      await interaction.followUp("Back to the previous song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏸":
                      if (!paused) {
                        queue.node.pause();
                        await interaction.followUp("song pasued");
                        await reaction.users.remove(user.id);
                        paused = true;
                      } else {
                        queue.node.resume();
                        await interaction.followUp("Playing!");
                        await reaction.users.remove(user.id);
                        paused = false;
                      }
                      break;
                    case "⏹":
                      queue.node.stop();
                      await interaction.followUp("Stopped playing!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏩":
                      queue.node.skip();
                      await interaction.followUp("Skipped current song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔂":
                      if (!loop) {
                        queue.node.setRepeatMode();
                        await interaction.followUp(
                          "Loop mode for current song is On"
                        );
                        await reaction.users.remove(user.id);
                        loop = true;
                      } else {
                        queue.setRepeatMode();
                        await interaction.followUp("Loop mode is off");
                        await reaction.users.remove(user.id);
                        loop = false;
                      }
                      break;
                    case "🔁":
                      if (!loopQueue) {
                        queue.setRepeatMode();
                        await interaction.followUp(
                          "Loop mode for current queue is On"
                        );
                        await reaction.users.remove(user.id);
                        loopQueue = true;
                      } else {
                        queue.setRepeatMode();
                        await interaction.followUp("Loop mode is off");
                        await reaction.users.remove(user.id);
                        loopQueue = false;
                      }
                      break;
                    case "❌":
                      await interaction.guild.members.me.voice.disconnect();
                      await reaction.users.remove(user.id);
                      await interaction.followUp("Disconnected");
                      break;
                  }
                });
              })
              .catch((e) => console.log(e));
          });
      } catch (e) {
        console.log(e);
        return interaction.followUp(`Something went wrong: ${e}`);
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
//           ) && user.id === message.author.id
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
