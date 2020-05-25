<template>
  <v-card>
    <v-container class="text-center">
      <v-row justify="center">
        <v-col cols="auto">
          <v-row>
            <input
              v-model="work.minutes"
              maxlength="3"
              @input="inputHandler($event)"
              @blur="work.minutes = inputTempValue"
            />
            <span id="semi">:</span>
            <input
              v-model="work.seconds"
              maxlength="2"
              @input="inputHandler($event)"
              @blur="work.seconds = inputTempValue"
            />
          </v-row>
          <label>Work Time</label>
        </v-col>
      </v-row>
      <input id="break" />
      <label for="break">Break</label>
      <input id="longbreak" />
      <label for="longbreak">Long break</label>
      <v-row>
        <v-col>
          <v-btn @click="save()">Save</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn @click="reset()">Reset</v-btn>
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
      defaultTimes: [20.5 * 60, 5 * 60, 10 * 60],
      work: {
        minutes: 0,
        seconds: 0
      },
      break: {
        minutes: 0,
        seconds: 0
      },
      long: {
        minutes: 0,
        seconds: 0
      },
      inputTempValue: 0
    };
  },
  methods: {
    inputHandler(event) {
      if (!isNaN(event.target.value)) {
        this.inputTempValue = event.target.value;
      }
    },
    minutesToSecs(minutes, seconds) {
      return minutes * 60 + seconds;
    },
    retrieve() {
      chrome.storage.sync.get("settings", result => {
        let workTime, breakTime, longTime;
        if (result.settings) {
          workTime = this.calcTimeMinutes(result.settings.work);
          breakTime = this.calcTimeMinutes(result.settings.break);
          longTime = this.calcTimeMinutes(result.settings.long);
        } else {
          workTime = this.calcTimeMinutes(this.defaultTimes[0]);
          breakTime = this.calcTimeMinutes(this.defaultTimes[1]);
          longTime = this.calcTimeMinutes(this.defaultTimes[2]);
        }

        this.work.minutes = workTime.minutes;
        this.work.seconds = workTime.seconds;
        this.break.minutes = breakTime.minutes;
        this.break.seconds = breakTime.seconds;
        this.long.minutes = longTime.minutes;
        this.long.seconds = longTime.seconds;
      });
    },
    save() {
      chrome.storage.sync.set({
        settings: {
          work: this.minutesToSecs(this.work.minutes, this.work.seconds),
          break: this.minutesToSecs(this.break.minutes, this.break.seconds),
          long: this.minutesToSecs(this.long.minutes, this.long.seconds)
        }
      });
    },
    reset() {
      chrome.storage.sync.clear();
      this.save();
    }
  },
  created() {
    this.retrieve();
  }
};
</script>

<style>
div {
  overflow: hidden;
}

input {
  font-size: 60px !important;
  font-weight: 300 !important;
  max-height: 80px !important;
  width: 100px;
}

input:nth-child(1) {
  text-align: right;
}

input:focus {
  border: none;
  outline: none !important;
}

#semi {
  font-size: 50px;
}
</style>


