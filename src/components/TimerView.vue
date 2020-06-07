<template>
  <v-card tile>
    <v-toolbar color="#FFA726">
      <v-tabs background-color="transparent" grow color="#444" v-model="status">
        <v-tab @click="setStatus(0)">Work</v-tab>
        <v-tab @click="setStatus(1)">Break</v-tab>
        <v-tab @click="setStatus(2)">Long break</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-container class="pb-3">
      <div class="text-center">
        <v-card-text class="display-2 font-weight-light pb-0">{{updateTime}}</v-card-text>
        <v-card-text class="title font-weight-light pa-2">{{getStatus}}</v-card-text>
      </div>

      <v-row justify="center">
        <v-col cols="auto" class="px-3" style="position:relative">
          <v-tooltip top content-class="tooltip">
            <template v-slot:activator="{on}">
              <v-btn small fab depressed elevation="3" color="#FFF" v-on="on" @click="startTimer()">
                <v-icon v-text="isTimerActive? 'mdi-pause': 'mdi-play'"></v-icon>
              </v-btn>
            </template>
            <span v-text="isTimerActive?'Pause': 'Start'"></span>
          </v-tooltip>
        </v-col>
        <v-col cols="auto" class="px-3">
          <v-tooltip top content-class="tooltip">
            <template v-slot:activator="{on}">
              <v-btn small fab depressed elevation="3" color="#FFF" v-on="on" @click="resetTimer()">
                <v-icon>mdi-replay</v-icon>
              </v-btn>
            </template>
            <span>Reset</span>
          </v-tooltip>
        </v-col>
        <v-col cols="auto" class="px-3">
          <v-tooltip top content-class="tooltip">
            <template v-slot:activator="{on}">
              <v-btn
                small
                fab
                depressed
                elevation="3"
                color="#FFF"
                v-on="on"
                @click="openOptions()"
              >
                <v-icon>mdi-cogs</v-icon>
              </v-btn>
            </template>
            <span>Options</span>
          </v-tooltip>
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
        this.status = response.status;
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

<style scoped>
.tooltip {
  background-color: #fff;
  color: #333;
  border: 1px solid;
}
</style>