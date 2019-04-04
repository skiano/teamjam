const components = {}

components['teamjam-snippet'] = {
  props: ['code'],
  template: `
    <pre class="solution__code"><code class="language-javascript" v-html="highlighted"></code></pre>
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
