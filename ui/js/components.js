const components = {}

components['teamjam-snippet'] = {
  props: ['code', 'title'],
  template: `
    <div class="snippet">
      <h4 v-if="title" class="snippet__title">{{title}}</h4>
      <pre class="snippet__code"><code class="language-javascript" v-html="highlighted"></code></pre>
    </div>
  `,
  computed: {
    highlighted() {
      return Prism.highlight(this.code, Prism.languages.javascript, 'javascript')
    }
  }
}

components['teamjam-console'] = {
  props: ['stdout'],
  template: `
    <pre class="console" v-html="stdout"/>
  `,
}

export default components
