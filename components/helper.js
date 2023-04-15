module.exports = {
  checkLinkType: function (link) {
    // Regular expressions to match YouTube and Spotify links
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
    const spotifyRegex =
      /^(https?:\/\/)?(open|play)\.spotify\.com\/([a-z]+)\/([a-zA-Z0-9]+)\??.*/;

    // Check if the link matches the YouTube regex
    if (youtubeRegex.test(link)) {
      return "youtube";
    }

    // Check if the link matches the Spotify regex
    if (spotifyRegex.test(link)) {
      return "spotify";
    }

    // If the link doesn't match either regex, assume it's plain text
    return "text";
  },
  checkYoutubeLinkType: function (link) {
    // Check if the link is a YouTube link
    if (link.includes("youtube.com")) {
      // Check if the link is a playlist link
      if (link.includes("&list=")) {
        return "playlist";
      } else {
        return "song";
      }
    } else {
      return "not a YouTube link";
    }
  },
  checkSpotifyLinkType: function (link) {
    // Regular expressions to match Spotify song and playlist links
    const songRegex =
      /^(https?:\/\/)?(open|play)\.spotify\.com\/track\/([a-zA-Z0-9]+)\??.*/;
    const playlistRegex =
      /^(https?:\/\/)?(open|play)\.spotify\.com\/playlist\/([a-zA-Z0-9]+)\??.*/;

    // Check if the link matches the song regex
    if (songRegex.test(link)) {
      return "song";
    }

    // Check if the link matches the playlist regex
    if (playlistRegex.test(link)) {
      return "playlist";
    }

    // If the link doesn't match either regex, return null
    return null;
  },
};
