const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("connect")
    .setDescription("Connect to your voice channel"),
  async execute(client, interaction) {
    if (!interaction.member.voice.channel)
      return interaction.editReply("You need to be in voice channel");

    let queue = await client.player.createQueue(interaction.guild.id, {
      metadata: { channel: interaction.channel },
      bufferingTimeout: 1000,
      disableVolume: false,
      leaveOnEnd: false,
      leaveOnStop: false,
      leaveOnEmpty: false,
      deafenOnJoin: true,
      spotifyBridge: false,
    });
    await queue.join(interaction.member.voice.channel);
    interaction.editReply("Joined to your voice channel");
  },
};
