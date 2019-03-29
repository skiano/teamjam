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
    sortedEvents(state) {
      const solves = {}

      return state.events.sort((a, b) => b.time - a.time).map((e) => {
        const solveKey = `${e.team}-${e.problem}`
        const alreadySolved = !!solves[solveKey]
        solves[solveKey] = true

        return {
          ...e,
          problem: state.problems.find(p => p.id === e.problem),
          alreadySolved
        }
      })
    },
    teams(state, getters) {
      let i = 0
      return getters.sortedEvents.reduce((teams, evt) => {
        const { team, problem, solution, points, alreadySolved } = evt
        const { id, title, description } = evt.problem

        if (!teams[team]) {
          teams[team] = { problems: {}, score: 0 }
        }

        if (!evt.alreadySolved) {
          teams[team].score = teams[team].score + points
          teams[team].problems[id] = {
            id: id,
            title: title,
            description: description,
            solutions: [],
          }
        }

        const s = solution.replace(/(\/\*)[\s\S]*(\*\/)\s*/m, '')

        teams[team].problems[id].solutions.unshift(s)

        return teams
      }, {})
    }
  }
})

// store.subscribe((mutation, state) => {
//   console.log('PROBLEMS', state.problems)
//   console.log('TEAMS', store.getters.teams)
// })

export default store
