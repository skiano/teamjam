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
        const alreadyDigested = state.events.some(e => e.time === evt.time)
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

      serverEvents.addEventListener('event', function(e) {
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
    events(state, getters) {
      return state.events
        .map((event) => {
          return {
            ...event,
            problem: state.problems.find(p => p.id === event.problemId)
          }
        })
        .sort((a, b) => a.time - b.time)
    },
    eventsReversed(state, getters) {
      return [...getters.events].reverse()
    },
    teams(state, getters) {
      const teams = {}

      getters.events.forEach((event) => {
        if (!teams[event.team]) {
          teams[event.team] = {
            team: event.team,
            score: 0,
            solutions: {},
          }
        }

        if (event.firstSolve) {
          teams[event.team].solutions[event.problemId] = []
          teams[event.team].score += event.points
        }

        if (event.type === 'solve') {
          teams[event.team].solutions[event.problemId].unshift(event.code)
        }
      })

      return Object.values(teams).sort((a, b) => a.team > b.team ? 1 : -1)
    },
    problems(state, getters) {
      console.log(state.problems)
      return state.problems
        .map((problem) => ({
          ...problem,
          solvers: getters.teams.filter(t => !!t.solutions[problem.id])
        }))
    },
  },
})

export default store
