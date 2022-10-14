# Spotify Quiz [![CodeQL](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/codeql-analysis.yml) [![Node.js CI (Server)](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/node.js.server.yml/badge.svg)](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/node.js.server.yml) [![Node.js CI (Client)](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/node.js.client.yml/badge.svg)](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/node.js.client.yml) [![Deploy](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/deploy.yml/badge.svg)](https://github.com/NachoToast/SpotifyQuiz/actions/workflows/deploy.yml)

How well do you know your Spotify playlists?

This is the source code for [Spotify Quiz](https://spotify.nachotoast.com/) and it's [API](https://spq.nachotoast.com/), a website where you can load up one of your Spotify playlists and then try to guess the songs as it plays through them.

You can set it up using any random playlist URL, as long as it is public.

# Installation

## Client Installation

```sh
cd client
yarn # or npm install
yarn start # or npm start
```

You can configure the server endpoint and Spotify ID once the app is running by going to the `/settings` page (http://localhost:3000/settings by default).

## Server Installation

```sh
cd server
yarn # or npm install
cp config.example.json config.json
```

You now need to enter some information such as your Spotify client ID, and frontend website origin (for CORS) into the [config.json](server/config.json) file.

Documentation for all the values can be found [here](server/src/config.ts).

```sh
yarn start # or npm start
```
