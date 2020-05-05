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
        <v-card-text class="display-2 pb-0">{{activeTime}}</v-card-text>
        <v-card-text class="title font-weight-regular">{{status}}</v-card-text>
      </div>
      <v-row justify="center">
        <v-col class="text-center">
          <v-btn
            class="mr-5"
            small
            fab
            depressed
            elevation="3"
            @click="isTimerActive = !isTimerActive"
          >
            <v-icon v-text="isTimerActive? 'mdi-pause': 'mdi-play'"></v-icon>
          </v-btn>

          <v-btn class="mr-5" small fab depressed elevation="3">
            <v-icon>mdi-replay</v-icon>
          </v-btn>

          <v-btn small fab depressed elevation="3">
            <v-icon>mdi-help</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      workingTimer: null,
      activeTime: 0,
      isTimerActive: false,
      status: "working session #1"
    };
  },
  mounted() {
    if (!this.workingTimer) {
      this.workingTimer = setInterval(() => {
        this.activeTime++;
      }, 1000);
    }
  }
};
</script>