# Pomodoro Timer Extension

This pet project is a chrome extension for pomodoro timer techinque. The main idea is to split your work in short short 25-minute productive sprints followed by 5-minute breaks. This way you preserve your energy and focus, oppose to long sessions without any breaks. This extension implements different timers for you, automatically following working sessions by breaks, untill reset or paused. All timers and notifications are configurable in Settings page.

## Technologies

Vue.js, Vuetify, [Vue CLI browser extension](https://github.com/adambullmer/vue-cli-plugin-browser-extension) by Adam Bullmer

## Setup

`npm run serve` - dev server with reload

`npm run build` - production build

## Directories

`src/components` - .vue Components for popup.html and options.html

`src/mixns` - mixin to share timer logic

`src/options` - compiled and built to options.html

`src/popup` - compiled and built to popup.html
