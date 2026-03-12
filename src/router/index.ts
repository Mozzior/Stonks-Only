import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

// Lazy load components for performance
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Profile = () => import('../views/Profile.vue')
const Wallet = () => import('../views/Wallet.vue')
const Membership = () => import('../views/Membership.vue')
const Training = () => import('../views/Training.vue')
const Leaderboard = () => import('../views/Leaderboard.vue')
const Settings = () => import('../views/Settings.vue')
const About = () => import('../views/About.vue')
const Review = () => import('../views/Review.vue')

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/register', name: 'register', component: Register, meta: { public: true } },
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', component: Home, meta: { title: 'Dashboard' } },
      { path: 'training', name: 'training', component: Training, meta: { title: 'Training Simulation' } },
      { path: 'review', name: 'review', component: Review, meta: { title: 'Performance Review' } },
      { path: 'leaderboard', name: 'leaderboard', component: Leaderboard, meta: { title: 'Leaderboard' } },
      { path: 'wallet', name: 'wallet', component: Wallet, meta: { title: 'My Wallet' } },
      { path: 'membership', name: 'membership', component: Membership, meta: { title: 'Membership & Achievements' } },
      { path: 'profile', name: 'profile', component: Profile, meta: { title: 'Profile' } },
      { path: 'settings', name: 'settings', component: Settings, meta: { title: 'Settings' } },
      { path: 'about', name: 'about', component: About, meta: { title: 'About' } },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

