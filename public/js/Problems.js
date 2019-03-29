export default {
  name: 'problems',
  template: `
    <ul>
      <li v-for="problem in problems" :key="problem.id">
        <h3>{{problem.title}}</h3>
        <p>{{problem.description}}</p>
      </li>
    </ul>
  `,
  computed: {
    ...Vuex.mapState(['problems'])
  }
}
