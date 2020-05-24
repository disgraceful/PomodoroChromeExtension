<template>
  <v-card>
    <v-container class="pb-5">
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn>Work</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn>Break</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn>Long Break</v-btn>
        </v-col>
      </v-row>
      <div class="text-center">
        <v-card-text class="display-2 pb-0">{{updateTime}}</v-card-text>
        <v-card-text class="title font-weight-regular"></v-card-text>
      </div>
      <v-row justify="center">
        <v-col class="text-center">
          <v-btn class="mr-5" small fab depressed elevation="3" @click="startTimer()">
            <v-icon v-text="isTimerActive? 'mdi-pause': 'mdi-play'"></v-icon>
          </v-btn>

          <v-btn class="mr-5" small fab depressed elevation="3" @click="resetTimer()">
            <v-icon>mdi-replay</v-icon>
          </v-btn>

          <v-btn small fab depressed elevation="3" @click="finishTimer()">
            <v-icon>mdi-help</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import timerMixin from "../mixins/timerMixin";
export default {
  data() {
    return {
      activeTime: 0,
      isTimerActive: false
    };
  },
  computed: {},
  methods: {
    getBackgroundTime() {
      chrome.runtime.sendMessage({ event: "get" }, response => {
        console.log(response);
        this.isTimerActive = response.state == 1;
        this.activeTime = response.time;
      });
    },
    startTimer() {
      this.isTimerActive = !this.isTimerActive;
      if (this.isTimerActive) {
        chrome.runtime.sendMessage({
          event: "start"
        });
      } else {
        chrome.runtime.sendMessage({ event: "pause" });
      }
    },
    resetTimer() {
      chrome.runtime.sendMessage({ event: "reset" });
    },
    finishTimer() {
      chrome.runtime.sendMessage({ event: "set" });
    }
  },
  mixins: [timerMixin],
  created() {
    this.getBackgroundTime();
  },
  mounted() {
    chrome.runtime.sendMessage({ event: "reopen" });
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(request => {
        console.log(request);
        this.isTimerActive = request.state == 1;
        this.activeTime = request.time;
      });
    });
  }
};
</script>