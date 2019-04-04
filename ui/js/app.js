import store from './store.js'

store.dispatch('subscribeToEvents')
store.dispatch('fetchEvents')
store.dispatch('fetchProblems')

const routes = [
  // {
  //   path: '/',
  //   name: 'Problems',
  //   component: () => import('./Problems.js')
  // },
  // {
  //   path: '/teams',
  //   name: 'Teams',
  //   component: () => import('./Teams.js')
  // },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('./Timeline.js')
  },
]

const router = new VueRouter({ routes })

new Vue({
  store,
  router,
  el: '#app',
  template: `
    <div class="layout" v-if="currentRoute">
      <header class="layout__header">
        <router-link
          class="header__link"
          v-for="route in routes"
          :key="route.path"
          :to="route.path">
          {{route.name}}
        </router-link>
      </header>
      <main class="layout__main">
        <router-view></router-view>
      </main>
    </div>
  `,
  data: () => ({
    routes: routes,
  }),
  computed: {
    currentRoute () {
      return this.$route.path
    },
  },
})
