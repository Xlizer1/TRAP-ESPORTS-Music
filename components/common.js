const { useMasterPlayer, useQueue, Track } = require("discord-player");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  connect: async function (interaction) {
    const player = useMasterPlayer();
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

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

    await queue.connect(interaction.member.voice.channel);
    interaction.editReply("Joined to your voice channel");
  },
  playYoutubeSong: async function (interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    const player = useMasterPlayer();

    const channel = interaction.member.voice.channel;

    player.nodes.create(interaction.guild.id, {
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

    let query = interaction.options._hoistedOptions[0].value;

    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: "youtubeSearch",
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

        embed
          .setTitle(tracks[0].raw.title)
          .setDescription(tracks[0].raw.description)
          .setColor("#FFFFFF");
        const message = await interaction
          .editReply({ embeds: [embed] })
          .then(async (msg) => {
            await msg
              .react("⏪")
              .then(async () => {
                await msg.react("⏸");
                await msg.react("⏹");
                await msg.react("⏩");
                await msg.react("🔀");
                await msg.react("🔂");
                await msg.react("🔁");
                await msg.react("❌");
              })
              .then(async () => {
                const filter = (reaction, user) => {
                  return (
                    ["⏪", "⏸", "⏹", "⏩", "🔀", "🔂", "🔁", "❌"].includes(
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
                  const guildQueue = useQueue(interaction.guild.id);

                  switch (reactionName) {
                    case "⏪":
                      guildQueue.history.back();
                      await interaction.followUp("Back to the previous song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏸":
                      if (!paused) {
                        guildQueue.node.pause();
                        await interaction.followUp("Song pasued!");
                        await reaction.users.remove(user.id);
                        paused = true;
                      } else {
                        guildQueue.node.resume();
                        await interaction.followUp("Playing!");
                        await reaction.users.remove(user.id);
                        paused = false;
                      }
                      break;
                    case "⏹":
                      guildQueue.node.stop();
                      await interaction.followUp("Stopped playing!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏩":
                      guildQueue.node.skip();
                      await interaction.followUp("Skipped current song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔀":
                      guildQueue.tracks.shuffle();
                      await interaction.followUp("Shuffle mode is On!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔂":
                      if (!loop) {
                        guildQueue.setRepeatMode(1);
                        await interaction.followUp(
                          "Loop mode for current song is On!"
                        );
                        await reaction.users.remove(user.id);
                        loop = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
                        await reaction.users.remove(user.id);
                        loop = false;
                      }
                      break;
                    case "🔁":
                      if (!loopQueue) {
                        guildQueue.setRepeatMode(2);
                        await interaction.followUp(
                          "Loop mode for current queue is On!"
                        );
                        await reaction.users.remove(user.id);
                        loopQueue = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
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
  playYoutubePlaylist: async function (interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    const player = useMasterPlayer();

    const channel = interaction.member.voice.channel;

    player.nodes.create(interaction.guild.id, {
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

    let query = interaction.options._hoistedOptions[0].value;

    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: "youtubePlaylist",
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

        const message = await interaction
          .editReply({ embeds: [embed] })
          .then(async (msg) => {
            await msg
              .react("⏪")
              .then(async () => {
                await msg.react("⏸");
                await msg.react("⏹");
                await msg.react("⏩");
                await msg.react("🔀");
                await msg.react("🔂");
                await msg.react("🔁");
                await msg.react("❌");
              })
              .then(async () => {
                const filter = (reaction, user) => {
                  return (
                    ["⏪", "⏸", "⏹", "⏩", "🔀", "🔂", "🔁", "❌"].includes(
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
                  const guildQueue = useQueue(interaction.guild.id);

                  switch (reactionName) {
                    case "⏪":
                      guildQueue.history.back();
                      await interaction.followUp("Back to the previous song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏸":
                      if (!paused) {
                        guildQueue.node.pause();
                        await interaction.followUp("Song pasued!");
                        await reaction.users.remove(user.id);
                        paused = true;
                      } else {
                        guildQueue.node.resume();
                        await interaction.followUp("Playing!");
                        await reaction.users.remove(user.id);
                        paused = false;
                      }
                      break;
                    case "⏹":
                      guildQueue.node.stop();
                      await interaction.followUp("Stopped playing!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏩":
                      guildQueue.node.skip();
                      await interaction.followUp("Skipped current song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔀":
                      guildQueue.tracks.shuffle();
                      await interaction.followUp("Shuffle mode is On!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔂":
                      if (!loop) {
                        guildQueue.setRepeatMode(1);
                        await interaction.followUp(
                          "Loop mode for current song is On!"
                        );
                        await reaction.users.remove(user.id);
                        loop = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
                        await reaction.users.remove(user.id);
                        loop = false;
                      }
                      break;
                    case "🔁":
                      if (!loopQueue) {
                        guildQueue.setRepeatMode(2);
                        await interaction.followUp(
                          "Loop mode for current queue is On!"
                        );
                        await reaction.users.remove(user.id);
                        loopQueue = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
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
  playSpotifySong: async function (interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    const player = useMasterPlayer();

    const channel = interaction.member.voice.channel;

    player.nodes.create(interaction.guild.id, {
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

    let query = interaction.options._hoistedOptions[0].value;

    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: "spotifySong",
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

        embed
          .setTitle(tracks[0].raw.title)
          .setDescription(tracks[0].raw.description)
          .setColor("#FFFFFF");

        const message = await interaction
          .editReply({ embeds: [embed] })
          .then(async (msg) => {
            await msg
              .react("⏪")
              .then(async () => {
                await msg.react("⏸");
                await msg.react("⏹");
                await msg.react("⏩");
                await msg.react("🔀");
                await msg.react("🔂");
                await msg.react("🔁");
                await msg.react("❌");
              })
              .then(async () => {
                const filter = (reaction, user) => {
                  return (
                    ["⏪", "⏸", "⏹", "⏩", "🔀", "🔂", "🔁", "❌"].includes(
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
                  const guildQueue = useQueue(interaction.guild.id);

                  switch (reactionName) {
                    case "⏪":
                      guildQueue.history.back();
                      await interaction.followUp("Back to the previous song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏸":
                      if (!paused) {
                        guildQueue.node.pause();
                        await interaction.followUp("Song pasued!");
                        await reaction.users.remove(user.id);
                        paused = true;
                      } else {
                        guildQueue.node.resume();
                        await interaction.followUp("Playing!");
                        await reaction.users.remove(user.id);
                        paused = false;
                      }
                      break;
                    case "⏹":
                      guildQueue.node.stop();
                      await interaction.followUp("Stopped playing!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏩":
                      guildQueue.node.skip();
                      await interaction.followUp("Skipped current song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔀":
                      guildQueue.tracks.shuffle();
                      await interaction.followUp("Shuffle mode is On!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔂":
                      if (!loop) {
                        guildQueue.setRepeatMode(1);
                        await interaction.followUp(
                          "Loop mode for current song is On!"
                        );
                        await reaction.users.remove(user.id);
                        loop = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
                        await reaction.users.remove(user.id);
                        loop = false;
                      }
                      break;
                    case "🔁":
                      if (!loopQueue) {
                        guildQueue.setRepeatMode(2);
                        await interaction.followUp(
                          "Loop mode for current queue is On!"
                        );
                        await reaction.users.remove(user.id);
                        loopQueue = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
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
  playSpotifyPlaylist: async function (interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    const player = useMasterPlayer();

    const channel = interaction.member.voice.channel;

    player.nodes.create(interaction.guild.id, {
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

    let query = interaction.options._hoistedOptions[0].value;

    const result = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: "spotifyPlaylist",
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

        const message = await interaction
          .editReply({ embeds: [embed] })
          .then(async (msg) => {
            await msg
              .react("⏪")
              .then(async () => {
                await msg.react("⏸");
                await msg.react("⏹");
                await msg.react("⏩");
                await msg.react("🔀");
                await msg.react("🔂");
                await msg.react("🔁");
                await msg.react("❌");
              })
              .then(async () => {
                const filter = (reaction, user) => {
                  return (
                    ["⏪", "⏸", "⏹", "⏩", "🔀", "🔂", "🔁", "❌"].includes(
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
                  const guildQueue = useQueue(interaction.guild.id);

                  switch (reactionName) {
                    case "⏪":
                      guildQueue.history.back();
                      await interaction.followUp("Back to the previous song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏸":
                      if (!paused) {
                        guildQueue.node.pause();
                        await interaction.followUp("Song pasued!");
                        await reaction.users.remove(user.id);
                        paused = true;
                      } else {
                        guildQueue.node.resume();
                        await interaction.followUp("Playing!");
                        await reaction.users.remove(user.id);
                        paused = false;
                      }
                      break;
                    case "⏹":
                      guildQueue.node.stop();
                      await interaction.followUp("Stopped playing!");
                      await reaction.users.remove(user.id);
                      break;
                    case "⏩":
                      guildQueue.node.skip();
                      await interaction.followUp("Skipped current song!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔀":
                      guildQueue.tracks.shuffle();
                      await interaction.followUp("Shuffle mode is On!");
                      await reaction.users.remove(user.id);
                      break;
                    case "🔂":
                      if (!loop) {
                        guildQueue.setRepeatMode(1);
                        await interaction.followUp(
                          "Loop mode for current song is On!"
                        );
                        await reaction.users.remove(user.id);
                        loop = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
                        await reaction.users.remove(user.id);
                        loop = false;
                      }
                      break;
                    case "🔁":
                      if (!loopQueue) {
                        guildQueue.setRepeatMode(2);
                        await interaction.followUp(
                          "Loop mode for current queue is On!"
                        );
                        await reaction.users.remove(user.id);
                        loopQueue = true;
                      } else {
                        guildQueue.setRepeatMode(0);
                        await interaction.followUp("Loop mode is off!");
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
