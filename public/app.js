import store from './store.js'

store.dispatch('subscribeToEvents')
store.dispatch('fetchEvents')
store.dispatch('fetchProblems')

new Vue({
  el: '#app',
  template: `
    <pre>{{teams}}</pre>
  `,
  computed: {
    teams () {
	    return JSON.stringify(store.getters.teams, null, 2)
    }
  },
})
