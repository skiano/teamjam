export default {
  name: 'timeline',
  template: `
    <ul class="timeline">
      <li class="event" v-for="event in reversedEvents" :key="event.id">
        <p class="event__message">
          <span class="event__timestamp">{{new Date(event.time).toLocaleString()}}</span>
          {{event.team}} solved "{{event.problem.title}}"
          <span v-if="!event.alreadySolved">+{{event.problem.points}} points</span>
          <span v-if="event.alreadySolved">resolved</span>
        </p>
      </li>
    </ul>
  `,
  computed: {
    ...Vuex.mapGetters(['reversedEvents'])
  }
}
