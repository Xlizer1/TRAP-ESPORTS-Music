const { useMasterPlayer } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
const common = require("../components/common");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("connect")
    .setDescription("Connect to your voice channel"),
  async execute(interaction) {
    common.connect(interaction);
  },
};
