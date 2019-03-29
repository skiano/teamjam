export default {
  name: 'teams',
  template: `
  <el-collapse>
    <el-collapse-item  v-for="(status, team) in teams" :key="team" :title="team" :name="team">
      <template slot="title">
        <h2>{{team}} <span>{{status.score}}</span></h2>
      </template>
      <el-card v-for="problem in status.problems" :key="problem.id" class="box-card">
        <div slot="header" class="clearfix">
          <span>{{problem.title}}</span>
        </div>
        <pre class="code-snippet">{{problem.solutions[0]}}</pre>
      </el-card>
    </el-collapse-item>
  </el-collapse>
  `,
  computed: {
    ...Vuex.mapGetters(['teams'])
  },
}
