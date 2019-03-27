import store from './store.js'

store.dispatch('subscribeToEvents')
store.dispatch('fetchEvents')
store.dispatch('fetchProblems')

new Vue({
  el: '#app',
  template: `
    <div>
      <ul>
        <li v-for="(status, team) in teams">
          <h3>{{ team }} - Score: {{status.score}}</h3>
          <ul>
            <li v-for="problem in status.problems">
              {{ problem.title }}
              <pre>{{problem.solution}}</pre>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `,
  computed: {
    teams () {
	    return store.getters.teams
    }
  },
})
