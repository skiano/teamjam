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
      return state.events.map(e => {
        return {
          ...e,
          ...state.problems.find(p => p.id === e.problem),
          // TODO: detect a resolve for better timeline
        }
      }).sort((a, b) => b.time - a.time)
    },
    teams(state) {
      return state.events.reduce((teams, evt) => {
        const { team, problem, solution, points } = evt
        const { title, description } = state.problems.find(p => p.id === problem) || {}

        if (!teams[team]) {
          teams[team] = { problems: {}, score: 0 }
        }

        if (!teams[team].problem) {
          teams[team].score = teams[team].score + points
        }

        teams[team].problems[problem] = {
          id: problem,
          title: title,
          description: description,
          solution: solution.replace(/(\/\*)[\s\S]*(\*\/)\s*/m, '')
        }

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
