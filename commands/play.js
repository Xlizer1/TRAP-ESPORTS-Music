const { RepeatMode } = require("discord-music-player/dist");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
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
    ),
  async execute(client, interaction) {
    await interaction.deferReply();
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    let queue = await client.player.createQueue(interaction.guild.id, {
      metadata: { channel: interaction.channel },
      bufferingTimeout: 1000,
      disableVolume: false,
      leaveOnEnd: true,
      leaveOnStop: true,
      spotifyBridge: false,
    });

    const searchTerms = interaction.options.get("search").value;

    const video = await play.search(searchTerms, { limit: 1 });
    if (!video[0])
      return interaction.editReply("Sorry, I couldn't find that song!");

    const stream = await play.stream(video[0].url);

    try {
      await queue.join(interaction.member.voice.channel);
    } catch (e) {
      console.log(e);
    }
    await queue.play(stream.video_url);

    const embed = new EmbedBuilder()
      .setColor(0x23272a)
      .setTitle(video[0].title)
      .setURL(video[0].url)
      .setDescription(video[0].description);

    const message = await interaction
      .editReply({
        ephemeral: true,
        embeds: [embed],
      })
      .then(async (msg) => {
        await msg
          .react("⏸")
          .then(() => msg.react("⏹"))
          .then(() => msg.react("⏩"))
          .then(() => msg.react("⏭"))
          .then(() => msg.react("🔀"))
          .then(() => msg.react("🔂"))
          .then(() => msg.react("🔁"));

        const filter = (reaction, user) => {
          return ["⏸", "⏹", "⏩", "⏭", "🔀", "🔂", "🔁"].includes(
            reaction.emoji.name
          );
        };

        const collector = msg.createReactionCollector(filter);

        let paused = false;

        collector.on("collect", async (reaction, user) => {
          let reactionName = await reaction.emoji.name;

          if (reactionName === "⏸") {
            if (!queue)
              return await interaction.editReply(
                "there is no song in the queue!"
              );
            if (!paused) {
              await queue.setPaused(true);
              paused = true;
            } else {
              await queue.setPaused(false);
              paused = false;
            }
          } else if (reactionName === "⏹") {
            if (!queue)
              return await interaction.editReply(
                "there is no song in the queue!"
              );
            await queue.stop();
          } else if (reactionName === "⏩") {
            if (!queue)
              return await interaction.editReply(
                "there is no song in the queue!"
              );
            await queue.skip();
          } else if (reactionName === "⏭") {
            if (!queue)
              return await interaction.editReply("there is no queue!");
            await queue.clearQueue();
          } else if (reactionName === "🔀") {
            if (!queue)
              return await interaction.editReply("there is no queue!");
            await queue.shuffle();
          } else if (reactionName === "🔂") {
            if (!queue)
              return await interaction.editReply("there is no queue!");
            await queue.setRepeatMode(RepeatMode.SONG);
          } else if (reactionName === "🔁") {
            if (!queue)
              return await interaction.editReply(
                "there is no song in the queue!"
              );
            await queue.setRepeatMode(RepeatMode.QUEUE);
          }

          await reaction.users.remove(user.id);
        });
      });
  },
};
