const { RepeatMode } = require("discord-music-player/dist");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const play = require("play-dl");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from Yoututbe!")
    .addStringOption((option) =>
      option
        .setName("search")
        .setDescription("Type you song name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const query = interaction.options.get("search").value;
    const results = await play.search(query);

    let tracks;
    tracks = results
      .map((t) => ({
        name: t.title,
        value: t.url,
      }))
      .slice(0, 5);

    if (results.playlist) {
      tracks = results
        .map(() => ({
          name: `${results.playlist.title} [playlist]`,
          value: results.playlist.url,
        }))
        .slice(0, 1);
    }

    return interaction.respond(tracks);
  },
  async execute(client, interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    let queue = await client.player.createQueue(interaction.guild.id, {
      metadata: { channel: interaction.channel },
      bufferingTimeout: 1000,
      disableVolume: false,
      leaveOnEnd: false,
      leaveOnStop: false,
      spotifyBridge: false,
    });

    const searchTerms = interaction.options.get("search").value;

    function isValidLink(str) {
      const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
      return pattern.test(str);
    }

    let embed = null;
    let embedObj = null;

    try {
      if (isValidLink(searchTerms)) {
        await queue.join(interaction.member.voice.channel);
        queue.play(searchTerms);
        embedObj = searchTerms;
      } else {
        const video = await play.search(searchTerms, { limit: 1 });
        if (!video[0])
          return await interaction.editReply(
            "Sorry, I couldn't find that song!"
          );

        const stream = await play.stream(video[0].url);
        await queue.join(interaction.member.voice.channel);
        queue.play(stream.video_url);

        embed = new EmbedBuilder()
          .setColor(0x23272a)
          .setTitle(video[0].title)
          .setURL(video[0].url)
          .setDescription(video[0].description);
        embedObj = {
          ephemeral: true,
          embeds: [embed],
        };
      }
    } catch (e) {
      console.log(e);
    }

    const message = await interaction.editReply(embedObj).then(async (msg) => {
      await msg
        .react("⏸")
        .then(async () => {
          await msg.react("⏹");
          await msg.react("⏩");
          await msg.react("🔂");
          await msg.react("🔁");
          await msg.react("❌");
        })
        .then(async () => {
          const filter = (reaction, user) => {
            return (
              ["⏸", "⏹", "⏩", "🔂", "🔁", "❌"].includes(
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
              case "⏸":
                if (!paused) {
                  if (!queue)
                    return interaction.followUp(
                      "There is no song in the queue to be paused!"
                    );
                  await queue.setPaused(true);
                  await interaction.followUp("song pasued");
                  paused = true;
                } else {
                  await queue.setPaused(false);
                  await interaction.followUp("Playing!");
                  paused = false;
                }
                break;
              case "⏹":
                if (!queue)
                  return interaction.followUp(
                    "There is no song in the queue to be stopped!"
                  );
                await queue.stop();
                await interaction.followUp("Stopped playing!");
                break;
              case "⏩":
                if (!queue)
                  return interaction.followUp(
                    "There is no song in the queue to be skipped!"
                  );
                await queue.skip();
                await interaction.followUp("Skipped current song!");
                break;
              case "🔂":
                if (!loop) {
                  if (!queue)
                    return interaction.followUp(
                      "There is no song in the queue to be looped!"
                    );
                  await queue.setRepeatMode(RepeatMode.SONG);
                  await interaction.followUp(
                    "Loop mode for current song is On"
                  );
                  loop = true;
                } else {
                  await queue.setRepeatMode(RepeatMode.DISABLED);
                  await interaction.followUp("Loop mode is off");
                  loop = false;
                }
                break;
              case "🔁":
                if (!queue)
                  return interaction.followUp(
                    "There is no queue to be looped!"
                  );
                if (!loopQueue) {
                  await queue.setRepeatMode(RepeatMode.QUEUE);
                  await interaction.followUp(
                    "Loop mode for current queue is On"
                  );
                  loopQueue = true;
                } else {
                  await queue.setRepeatMode(RepeatMode.DISABLED);
                  await interaction.followUp("Loop mode is off");
                  loopQueue = false;
                }
                break;
              case "❌":
                await queue.stop();
                await queue.leave();
                await interaction.followUp("Disconnected");
                break;
              default:
                await interaction.followUp("Playing!");
            }

            await reaction.users.remove(user.id);
          });
        })
        .catch((e) => console.log(e));
    });
  },
};
