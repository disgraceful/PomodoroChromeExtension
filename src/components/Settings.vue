<template>
  <v-card>
    <v-container class="text-center">
      <input id="work" v-model="selectedTimes[0]" />
      <label for="work">Work Time</label>
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
export default {
  data() {
    return {
      defaultTimes: [25, 5, 10],
      selectedTimes: []
    };
  },
  methods: {
    retrieve() {
      chrome.storage.sync.get("settings", result => {
        console.log(result);
        if (result.settings) {
          this.selectedTimes = new Array(
            result.settings.work,
            result.settings.break,
            result.settings.lbreak
          );
          console.log(this.selectedTimes);
        } else {
          this.selectedTimes = this.defaultTimes;
        }
      });
    },
    save() {},
    reset() {}
  },
  created() {
    console.log("created");
    chrome.storage.sync.set({
      settings: {
        work: 25,
        break: 5,
        lbreak: 10
      }
    });
    this.retrieve();
  }
};
</script>

<style>
div {
  overflow: hidden;
}
</style>


