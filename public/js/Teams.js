const Solution = {
  props: ['code'],
  template: `
    <pre class="solution__code"><code class="language-javascript" v-html="highlighted"></code></pre>
  `,
  computed: {
    highlighted() {
      return Prism.highlight(this.code, Prism.languages.javascript, 'javascript')
    }
  }
}

export default {
  name: 'teams',
  components: {
    'solution-snippet': Solution,
  },
  template: `
  <ul class="team-list">
    <li class="team" v-for="(team, i) in teams" :key="i">
      <h2 class="team__name">{{team.name}} <span>{{team.score}}</span></h2>
      <ul class="solution-list" v-for="problem in team.problems" :key="problem.id">
        <li class="solution">
          <h3 class="solution__title">{{problem.title}}</h3>
          <solution-snippet
            v-for="(solution, i) in problem.solutions"
            :code="solution"
            :key="i"/>
        </li>
      </ul>
    </li>
  </ul>
  `,
  computed: {
    ...Vuex.mapGetters(['teams'])
  },
}
