// /**
//  * plugins/vuetify.js
//  *
//  * Framework documentation: https://vuetifyjs.com`
//  */

// // Styles
// import '@mdi/font/css/materialdesignicons.css'
// import 'vuetify/styles'

// // Composables
// import { createVuetify } from 'vuetify'

// // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
// export default createVuetify({
//   theme: {
//     defaultTheme: 'dark',
//   },
// })
// src/plugins/vuetify.js
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css'; // MDI 아이콘 스타일 추가

export default createVuetify({
  theme: {

  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  components: {
  }
});
