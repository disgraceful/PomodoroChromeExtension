<template>
  <v-card>
    <v-container class="text-center">
      <v-row justify="center">
        <v-col cols="auto">
          <v-row>
            <input
              v-model.number="work.minutes"
              maxlength="3"
              @focus="inputTempValue = work.minutes"
              @input="inputHandler($event, minutesValidSymbolLimit)"
              @blur="work.minutes = inputTempValue"
            />
            <span id="semi">:</span>
            <input
              v-model="work.seconds"
              maxlength="2"
              @focus="inputTempValue = work.seconds"
              @input="inputHandler($event,secondsValidSymbolLimit)"
              @blur="work.seconds = inputTempValue"
            />
          </v-row>
          <label>Work Time</label>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-row align="center" justify="center">
            <input
              class="small-input"
              v-model.number="rest.minutes"
              maxlength="3"
              @focus="inputTempValue = rest.minutes"
              @input="inputHandler($event, minutesValidSymbolLimit)"
              @blur="rest.minutes = inputTempValue"
            />
            <span id="semi">:</span>
            <input
              class="small-input"
              v-model="rest.seconds"
              maxlength="2"
              @focus="inputTempValue = rest.seconds"
              @input="inputHandler($event,secondsValidSymbolLimit)"
              @blur="rest.seconds = inputTempValue"
            />
            <label>Break</label>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-row align="center" justify="center">
            <input
              class="small-input"
              v-model.number="long.minutes"
              maxlength="3"
              @focus="inputTempValue = long.minutes"
              @input="inputHandler($event, minutesValidSymbolLimit)"
              @blur="long.minutes = inputTempValue"
            />
            <span id="semi">:</span>
            <input
              class="small-input"
              v-model="long.seconds"
              maxlength="2"
              @focus="inputTempValue = long.seconds"
              @input="inputHandler($event,secondsValidSymbolLimit)"
              @blur="long.seconds = inputTempValue"
            />
            <label>long break</label>
          </v-row>
        </v-col>
      </v-row>

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
      rest: {
        minutes: 0,
        seconds: 0
      },
      long: {
        minutes: 0,
        seconds: 0
      },
      inputTempValue: 0,
      minutesValidSymbolLimit: 1,
      secondsValidSymbolLimit: 2
    };
  },
  methods: {
    inputHandler(event, limit) {
      console.dir(event.target);
      if (!isNaN(event.target.value) && event.target.value.length >= limit) {
        this.inputTempValue = event.target.value;
      }
    },
    minutesToSecs(minutes, seconds) {
      return parseInt(minutes) * 60 + parseInt(seconds);
    },
    retrieve() {
      chrome.storage.sync.get("settings", result => {
        let workTime, breakTime, longTime;
        console.log(result);
        if (result.settings) {
          workTime = this.calcTimeMinutes(result.settings.work);
          breakTime = this.calcTimeMinutes(result.settings.rest);
          longTime = this.calcTimeMinutes(result.settings.long);
        } else {
          workTime = this.calcTimeMinutes(this.defaultTimes[0]);
          breakTime = this.calcTimeMinutes(this.defaultTimes[1]);
          longTime = this.calcTimeMinutes(this.defaultTimes[2]);
        }

        this.work.minutes = workTime.minutes;
        this.work.seconds = workTime.seconds;
        this.rest.minutes = breakTime.minutes;
        this.rest.seconds = breakTime.seconds;
        this.long.minutes = longTime.minutes;
        this.long.seconds = longTime.seconds;
      });
    },
    save() {
      chrome.storage.sync.set({
        settings: {
          work: this.minutesToSecs(this.work.minutes, this.work.seconds),
          rest: this.minutesToSecs(this.rest.minutes, this.rest.seconds),
          long: this.minutesToSecs(this.long.minutes, this.long.seconds)
        }
      });
    },
    reset() {
      chrome.storage.sync.clear();
      this.retrieve();
    }
  },
  created() {
    this.retrieve();
  }
};
</script>

<style>
html {
  overflow-y: hidden !important;
}

input {
  font-size: 60px !important;
  font-weight: 300 !important;
  max-height: 80px !important;
  width: 100px;
}

.small-input {
  font-size: 30px !important;
  width: 50px;
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
  margin: 2px;
}

.small-input + #semi {
  font-size: 28px;
}
</style>


