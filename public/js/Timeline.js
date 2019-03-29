export default {
  name: 'timeline',
  template: `
    <ul>
      <li v-for="event in events" :key="event.id">
        {{event.team}} solved {{event.problem}}
      </li>
    </ul>
  `,
  computed: {
    ...Vuex.mapState(['events'])
  }
}
