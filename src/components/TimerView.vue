<template>
  <v-card tile>
    <v-toolbar color="#FFA726" elevation="2">
      <v-tabs background-color="transparent" grow color="#444" v-model="status">
        <v-tab @click="setStatus(0)">Work</v-tab>
        <v-tab @click="setStatus(1)">Break</v-tab>
        <v-tab @click="setStatus(2)">Long break</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-container class="pb-3">
      <v-tabs-items v-model="status">
        <v-tab-item v-for="i in 3" :key="i">
          <div class="text-center">
            <v-fade-transition leave-absolute>
              <v-card-text
                :key="`time-${activeTime}`"
                class="display-2 font-weight-light pb-0"
              >{{updateTime}}</v-card-text>
            </v-fade-transition>
            <v-card-text class="title font-weight-light pa-2">{{getStatus}}</v-card-text>
          </div>
        </v-tab-item>
      </v-tabs-items>

      <v-row justify="center">
        <v-col cols="auto" class="px-3" style="position:relative">
          <v-tooltip top content-class="tooltip">
            <template v-slot:activator="{on}">
              <v-fab-transition>
                <v-btn
                  v-show="!fabHidden"
                  small
                  fab
                  depressed
                  elevation="3"
                  color="#FFF"
                  v-on="on"
                  @click="startTimer()"
                >
                  <v-icon v-text="isTimerActive? 'mdi-pause': 'mdi-play'"></v-icon>
                </v-btn>
              </v-fab-transition>
            </template>
            <span v-text="isTimerActive?'Pause': 'Start'"></span>
          </v-tooltip>
        </v-col>
        <v-col cols="auto" class="px-3">
          <v-tooltip top content-class="tooltip">
            <template v-slot:activator="{on}">
              <v-fab-transition>
                <v-btn
                  v-show="!fabHidden"
                  small
                  fab
                  depressed
                  elevation="3"
                  color="#FFF"
                  v-on="on"
                  @click="resetTimer()"
                >
                  <v-icon>mdi-replay</v-icon>
                </v-btn>
              </v-fab-transition>
            </template>
            <span>Reset</span>
          </v-tooltip>
        </v-col>
        <v-col cols="auto" class="px-3">
          <v-tooltip top content-class="tooltip">
            <template v-slot:activator="{on}">
              <v-fab-transition>
                <v-btn
                  v-show="!fabHidden"
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
              </v-fab-transition>
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
  mixins: [timerMixin],
  data() {
    return {
      activeTime: 0,
      isTimerActive: false,
      status: 0,
      cycle: 0,
      fabHidden: true
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
    startTimer() {
      this.isTimerActive = !this.isTimerActive;
      chrome.runtime.sendMessage({
        event: this.isTimerActive ? "start" : "pause"
      });
    },

    resetTimer() {
      chrome.runtime.sendMessage({ event: "reset" });
    },

    setStatus(status) {
      chrome.runtime.sendMessage({ event: "status", status });
    },

    openOptions() {
      chrome.runtime.openOptionsPage();
      this.resetTimer();
    },

    getBackgroundTime() {
      chrome.runtime.sendMessage({ event: "get" }, response => {
        this.isTimerActive = response.state == 1;
        this.activeTime = response.time;
        this.status = response.status;
      });
    }
  },

  created() {
    this.getBackgroundTime();
    chrome.runtime.sendMessage({ event: "reopen" });
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(request => {
        this.isTimerActive = request.state == 1;
        this.activeTime = request.time;
        this.status = request.status;
        this.cycle = request.cycle;
      });
    });
  },

  mounted() {
    this.fabHidden = false;
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