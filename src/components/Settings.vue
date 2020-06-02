<template>
  <v-card>
    <v-container class="text-center">
      <v-row justify="center">
        <input
          type="text"
          v-model.number="work.minutes"
          maxlength="3"
          @focus="inputTempValue = work.minutes"
          @input="inputHandler($event, minutesValidSymbolLimit)"
          @blur="work.minutes = inputTempValue"
        />
        <span id="semi">:</span>
        <input
          type="text"
          v-model="work.seconds"
          maxlength="2"
          @focus="inputTempValue = work.seconds"
          @input="inputHandler($event,secondsValidSymbolLimit)"
          @blur="work.seconds = inputTempValue"
        />
      </v-row>
      <label class="title font-weight-light">Work Time</label>
      <v-row align="baseline" justify="center">
        <input
          type="text"
          class="small-input"
          v-model.number="rest.minutes"
          maxlength="3"
          @focus="inputTempValue = rest.minutes"
          @input="inputHandler($event, minutesValidSymbolLimit)"
          @blur="rest.minutes = inputTempValue"
        />
        <span id="semi">:</span>
        <input
          type="text"
          class="small-input"
          v-model="rest.seconds"
          maxlength="2"
          @focus="inputTempValue = rest.seconds"
          @input="inputHandler($event,secondsValidSymbolLimit)"
          @blur="rest.seconds = inputTempValue"
        />
        <label class="title font-weight-light">break</label>
      </v-row>
      <v-row justify="center" align="baseline">
        <div style="margin-left:40px">
          <input
            type="text"
            class="small-input"
            v-model.number="long.minutes"
            maxlength="3"
            @focus="inputTempValue = long.minutes"
            @input="inputHandler($event, minutesValidSymbolLimit)"
            @blur="long.minutes = inputTempValue"
          />
          <span id="semi">:</span>
          <input
            type="text"
            class="small-input"
            v-model="long.seconds"
            maxlength="2"
            @focus="inputTempValue = long.seconds"
            @input="inputHandler($event,secondsValidSymbolLimit)"
            @blur="long.seconds = inputTempValue"
          />
          <label class="title font-weight-light">long break</label>
        </div>
      </v-row>
      <hr />
      <v-row align="baseline">
        <v-col cols="auto" class="pb-0">
          <span class="title font-weight-light">Long break every</span>
          <input type="text" class="small-input text-center" v-model="workCycle" maxlength="1" />
          <span class="title font-weight-light">sessions</span>
        </v-col>
      </v-row>
      <v-row align="baseline">
        <v-col cols="auto" class="pb-0">
          <span class="title font-weight-light">Auto-resume timer:</span>
        </v-col>
        <v-col class="pa-0">
          <v-checkbox v-model="autoResume" hide-details color="#333"></v-checkbox>
        </v-col>
      </v-row>
      <v-row align="baseline">
        <v-col cols="auto" class="pb-0">
          <span class="title font-weight-light">Turn notifications:</span>
        </v-col>
        <v-col cols="auto" class="pa-0">
          <v-checkbox v-model="notifications" hide-details color="#333"></v-checkbox>
        </v-col>
      </v-row>
      <hr />
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
      defaultSettings: { workCycle: 4, autoResume: true, notifications: true },
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
      secondsValidSymbolLimit: 2,
      workCycle: 4,
      autoResume: true,
      notifications: true
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
        this.workCycle =
          result.settings.workCycle | this.defaultSettings.workCycle;
        this.autoResume =
          result.settings.autoResume | this.defaultSettings.autoResume;
        this.notifications =
          result.settings.notifications | this.defaultSettings.notifications;
      });
    },
    save() {
      chrome.storage.sync.set({
        settings: {
          work: this.minutesToSecs(this.work.minutes, this.work.seconds),
          rest: this.minutesToSecs(this.rest.minutes, this.rest.seconds),
          long: this.minutesToSecs(this.long.minutes, this.long.seconds),
          workCycle: this.workCycle,
          autoResume: this.autoResume,
          notifications: this.notifications
        }
      });
      chrome.runtime.sendMessage({ event: "saved" });
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

input[type="text"] {
  font-size: 60px;
  font-weight: 300;
  max-height: 80px;
  width: 100px;
}

input.small-input {
  font-size: 30px !important;
  width: 40px;
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

.v-input--selection-controls {
  margin-top: -5px !important;
}
</style>

