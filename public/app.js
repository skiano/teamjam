import Vue from 'https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.esm.browser.js'

console.log(Vue)

const source = new EventSource('/notification');

source.addEventListener("solve", function(e) {
  console.log(JSON.parse(e.data))
});

source.onerror = function(err) {
  console.log(err)
}
