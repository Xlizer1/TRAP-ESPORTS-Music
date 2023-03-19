const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
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
  async execute(interaction) {
    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return await interaction.reply(
        "You need to be in a voice channel to play music!"
      );

    const searchTerms = interaction.options.get("search").value;

    const video = await play.search(searchTerms, { limit: 1 });
    if (!video[0])
      return interaction.reply("Sorry, I couldn't find that song!");

    const stream = await play.stream(video[0].url);
    let resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    let player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
      metadata: {
        volume: 0.25,
        quality: "high",
      },
    });

    player.play(resource);
    connection.subscribe(player);
    interaction.channel.send(`Now playing: ${video[0].title}`);

    interaction.editReply("Task completed!");
  },
};
