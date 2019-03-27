import store from './store.js'

store.dispatch('subscribeToEvents')
store.dispatch('fetchEvents')
store.dispatch('fetchProblems')
