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
      <input id="break" v-model="selectedTimes[1]" />
      <label for="break">Break</label>
      <input id="longbreak" v-model="selectedTimes[2]" />
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

      selectedTimes: [],
      inputTempValue: 0
    };
  },
  methods: {
    inputHandler(event) {
      if (!isNaN(event.target.value)) {
        this.inputTempValue = event.target.value;
      }
    },
    retrieve() {
      chrome.storage.sync.get("settings", result => {
        console.log(result);
        if (result.settings) {
          this.selectedTimes = new Array(
            result.settings.work,
            result.settings.break,
            result.settings.lbreak
          );
          this.work.minutes = this.calcTimeMinutes(result.settings.work);
          this.work.seconds = this.calcTimeMinutes(result.settings.work);
          console.log(this.selectedTimes);
        } else {
          this.selectedTimes = this.defaultTimes;
        }
      });
    },
    save() {
      chrome.storage.sync.set({
        settings: {
          work: this.selectedTimes[0],
          break: this.selectedTimes[1],
          lbreak: this.selectedTimes[2]
        }
      });
    },
    reset() {
      chrome.storage.sync.clear();
      this.selectedTimes = this.defaultTimes;
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


