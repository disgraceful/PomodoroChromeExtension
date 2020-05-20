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
        <v-card-text class="title font-weight-regular">{{status}}</v-card-text>
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
      isTimerActive: false,
      status: 0, // 0=work, 1= break, 2 = longbreak;
      defaultTimes: [25, 5, 10]
    };
  },
  computed: {
    getDefaultTimeinSeconds() {
      return this.defaultTimes[this.status] * 60;
    }
  },
  methods: {
    startTimer() {
      this.isTimerActive = !this.isTimerActive;
      if (this.isTimerActive) {
        chrome.runtime.sendMessage({
          event: "start",
          time: this.getDefaultTimeinSeconds
        });
      } else {
        chrome.runtime.sendMessage({ event: "pause" });
      }
    },
    resetTimer() {
      chrome.runtime.sendMessage({ event: "reset" });
      this.activeTime = this.getDefaultTimeinSeconds;
      this.isTimerActive = false;
    },
    finishTimer() {
      chrome.runtime.sendMessage({ event: "set" });
    }
  },
  mixins: [timerMixin],
  created() {
    chrome.storage.local.get(["time", "state"], result => {
      console.log(result);
      this.isTimerActive = result.state == 1;
      this.activeTime =
        result.state === 0 ? this.getDefaultTimeinSeconds : result.time | 0;
      console.log("created", this.activeTime, this.isTimerActive);
    });
  },
  mounted() {
    chrome.runtime.sendMessage({ event: "reopen" });
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(request => {
        if (!isNaN(request)) {
          this.activeTime = request;
          console.log(this.activeTime);
        }
      });
    });
  },
  destroyed() {
    chrome.storage.local.clear();
  }
};
</script>