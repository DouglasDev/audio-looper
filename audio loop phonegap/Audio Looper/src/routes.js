import HomePage from './pages/home.vue';
import DynamicRoutePage from './pages/dynamic-route.vue';
import NotFoundPage from './pages/not-found.vue';
import adjustOffsetPage from './pages/adjust-offset.vue'
// import SelectSongPage from './pages/select-song.vue';
import PlaySongPage from './pages/play-song.vue';
import TestPlaySongPage from './pages/test-play-song.vue';

export default [
  {
    path: '/',
    component: HomePage,
  },
  // {
  //   path: '/select-song/:mode/',
  //   component: SelectSongPage,
  // },
  {
    path: '/play-song/',
    component: PlaySongPage,
    //reloadAll:true
  },
  {
    path: '/test-play-song/',
    component: TestPlaySongPage,
    //reloadAll:true
  },  {
    path: '/adjust-offset/',
    component: adjustOffsetPage,
    //reloadAll:true
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];
