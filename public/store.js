const fetchJSON = async (url) => {
  const res = await fetch(url)
  return res.json()
}

let serverEvents

const store = new Vuex.Store({
  state: {
    events: [],
    problems: [],
  },
  mutations: {
    addEvents(state, payload) {
      payload.forEach((evt) => {
        const alreadyDigested = state.events.some(e => e.id === evt.id)
        if (!alreadyDigested) {
          state.events.push(evt)
        }
      })
    },
    addProblems(state, payload) {
      payload.forEach((problem) => {
        state.problems.push(problem)
      })
    }
  },
  actions: {
    async subscribeToEvents(context) {
      serverEvents = new EventSource('/notification');

      serverEvents.addEventListener('solve', function(e) {
        context.commit('addEvents', [JSON.parse(e.data)])
      });

      serverEvents.onerror = function(err) {
        console.error(err)
      }
    },
    async fetchEvents(context) {
      const events = await fetchJSON('/events')
      context.commit('addEvents', events)
    },
    async fetchProblems(context) {
      const problemSet = await fetchJSON('/problems')
      context.commit('addProblems', problemSet.problems)
    },
  },
  getters: {
    teams(state) {
      console.log('state.events', state.events)
      return state.events.reduce((teams, evt) => {
        const { team, problem, solution, points } = evt

        if (!teams[team]) {
          teams[team] = { problems: {}, score: 0 }
        }

        if (!teams[team].problem) {
          teams[team].score = teams[team].score + points
        }

        teams[team].problems[problem] = state.problems.find(p => p.id === problem) || {}
        teams[team].problems[problem].solution = solution.replace(/(\/\*)[\s\S]*(\*\/)\s*/m, '')

        return teams
      }, {})
    }
  }
})

store.subscribe((mutation, state) => {
  console.log('PROBLEM')
  console.log('TEAMS', store.getters.teams)
})

export default store
