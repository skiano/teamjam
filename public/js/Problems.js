export default {
  name: 'problems',
  template: `
    <ul class="problem-list">
      <li class="problem" v-for="(problem, i) in problems" :key="problem.id">
        <h3 class="problem__title">
          {{i + 1}}. {{problem.title}} <em class="problem__points">{{problem.points}} points</em>
        </h3>
        <p class="problem__description">
          {{problem.description}}
        </p>
      </li>
    </ul>
  `,
  computed: {
    ...Vuex.mapState(['problems'])
  }
}
