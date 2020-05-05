<template>
  <v-app>
    <timer />
  </v-app>
</template>

<script>
import Timer from "@/components/Timer.vue";

export default {
  name: "App",
  components: { Timer }
};
</script>

<style>
html {
  width: 400px;
  height: auto;
}
</style>
