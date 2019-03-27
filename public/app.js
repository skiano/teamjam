import store from './store.js'

store.dispatch('subscribeToEvents')
store.dispatch('fetchEvents')
store.dispatch('fetchProblems')

new Vue({
  el: '#app',
  template: `
  <el-container>
    <el-header>
      <el-menu :default-active="'1'" class="el-menu-demo" mode="horizontal" @select="() => {}">
        <el-menu-item index="1">Teams</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <el-main>
        <el-collapse>
          <el-collapse-item  v-for="(status, team) in teams" :title="team" :name="team">
            <template slot="title">
              <h2>{{team}} <span>{{status.score}}</span></h2>
            </template>
            <el-card v-for="problem in status.problems" class="box-card">
              <div slot="header" class="clearfix">
                <span>{{problem.title}}</span>
              </div>
              <pre class="code-snippet">{{problem.solution}}</pre>
            </el-card>
          </el-collapse-item>
        </el-collapse>
      </el-main>
    </el-main>
  </el-container>
  `,
  computed: {
    teams () {
	    return store.getters.teams
    }
  },
})
