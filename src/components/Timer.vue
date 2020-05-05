<template>
  <v-card>
    <v-card-title>{{activeTime}}</v-card-title>
    <v-btn>Test</v-btn>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      activeTime: 0,
      isTimerActive: false
    };
  },
  mounted() {
    setInterval(() => {
      this.activeTime++;
    }, 1000);
  }
};
</script>