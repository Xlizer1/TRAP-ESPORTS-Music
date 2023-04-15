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
                await interaction.followUp("Loop mode for current song is On!");
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

exports = {
  message,
};
