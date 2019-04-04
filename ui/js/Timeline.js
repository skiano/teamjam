import components from './components.js'

export default {
  name: 'timeline',
  components: components,
  template: `
    <ul class="timeline">
      <li class="event" v-for="event in eventsReversed" :key="event.time">
        <time class="event__timestamp">{{new Date(event.time).toLocaleString()}}</time>
        <h3 class="event__heading">
          <strong class="event__team">{{event.team}}</strong>
          <em class="event__type">{{event.type}}</em>
          <span class="event__title">{{event.problem.title}}</span>
          <span v-if="event.points && event.points > 0">+{{event.problem.points}} points</span>
        </h3>
        <p class="event__message">
          <teamjam-snippet v-if="event.code" :code="event.code" :title="event.problem.title" />
          <teamjam-console v-if="event.consoleOutput" :stdout="event.consoleOutput" />
          <teamjam-console v-if="event.error" :stdout="event.error" />
        </p>
      </li>
    </ul>
  `,
  computed: {
    ...Vuex.mapGetters(['eventsReversed'])
  }
}
