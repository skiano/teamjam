export default {
  name: 'teams',
  template: `
  <ul class="team-list">
    <li class="team" v-for="(team, i) in teams" :key="i">
      <h2 class="team__name">{{team.name}} <span>{{team.score}}</span></h2>
      <ul class="solution-list" v-for="problem in team.problems" :key="problem.id">
        <li class="solution">
          <h3 class="solution__title">{{problem.title}}</h3>
          <pre
            class="solution__code"
            v-for="(solution, i) in problem.solutions"
            :key="i"><code class="language-javascript" v-html="solution"></code></pre>
        </li>
      </ul>
    </li>
  </ul>
  `,
  computed: {
    ...Vuex.mapGetters(['teams'])
  },
}
