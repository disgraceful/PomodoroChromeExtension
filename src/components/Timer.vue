<template>
  <v-card>
    <v-container class="pb-5">
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn @click="setStatus(0)">Work</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="setStatus(1)">Break</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="setStatus(2)">Long Break</v-btn>
        </v-col>
      </v-row>
      <div class="text-center">
        <v-card-text class="display-2 pb-0">{{updateTime}}</v-card-text>
        <v-card-text class="title font-weight-regular">{{getStatus}}</v-card-text>
      </div>
      <v-row justify="center">
        <v-col class="text-center">
          <v-btn class="mr-5" small fab depressed elevation="3" @click="startTimer()">
            <v-icon v-text="isTimerActive? 'mdi-pause': 'mdi-play'"></v-icon>
          </v-btn>

          <v-btn class="mr-5" small fab depressed elevation="3" @click="resetTimer()">
            <v-icon>mdi-replay</v-icon>
          </v-btn>
          <v-btn class="mr-5" small fab depressed elevation="3" @click="openOptions()">
            <v-icon>mdi-cogs</v-icon>
          </v-btn>
          <v-btn small fab depressed elevation="3" @click="finishTimer()">
            <v-icon>mdi-fast-forward</v-icon>
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
      status: 0,
      cycle: 0
    };
  },
  computed: {
    getStatus() {
      return this.status === 0
        ? `Working session #${this.cycle + 1}`
        : "Resting";
    }
  },
  methods: {
    getBackgroundTime() {
      chrome.runtime.sendMessage({ event: "get" }, response => {
        console.log("time", response);
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
    },
    setStatus(status) {
      chrome.runtime.sendMessage({ event: "status", status: status });
    },
    openOptions() {
      chrome.runtime.openOptionsPage();
      this.resetTimer();
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
        this.status = request.status;
        this.cycle = request.cycle;
      });
    });
  }
};
</script>