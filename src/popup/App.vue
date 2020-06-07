<template>
  <v-app>
    <pt-timer />
  </v-app>
</template>

<script>
import TimerView from "@/components/TimerView.vue";

export default {
  name: "App",
  components: { "pt-timer": TimerView }
};
</script>

<style>
html {
  width: 350px;
  height: auto;
}
</style>
