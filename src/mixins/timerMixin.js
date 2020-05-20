export default {
  computed: {
    updateTime() {
      let { hours, minutes, seconds } = this.calcTime(this.activeTime);
      return `${hours} : ${minutes} : ${seconds}`;
    },
  },
  methods: {
    calcTime(time) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = time % 60;
      return {
        hours: formatTime(hours),
        minutes: formatTime(minutes),
        seconds: formatTime(seconds),
      };
    },
  },
};

const formatTime = (time) => {
  if (time < 1) {
    return "00";
  }
  if (time < 10) {
    return `0${time}`;
  }
  return time;
};
