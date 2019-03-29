export default {
  name: 'timeline',
  template: `
    <ul class="timeline">
      <li class="event" v-for="event in sortedEvents" :key="event.id">
        <p class="event__message">
          <span class="event__timestamp">{{event.time}}</span>
          {{event.team}} solved {{event.problem}}
          +{{event.points}} points
        </p>
      </li>
    </ul>
  `,
  computed: {
    ...Vuex.mapGetters(['sortedEvents'])
  }
}
