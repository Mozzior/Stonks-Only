import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import { supabase } from "../utils/supabase";

// Lazy load components for performance
const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const Register = () => import("../views/Register.vue");
const ForgotPassword = () => import("../views/ForgotPassword.vue");
const ChangePassword = () => import("../views/ChangePassword.vue");
const UpdatePassword = () => import("../views/UpdatePassword.vue");
const PrivacyPolicy = () => import("../views/PrivacyPolicy.vue");
const TermsOfService = () => import("../views/TermsOfService.vue");
const DataDisclaimer = () => import("../views/DataDisclaimer.vue");
const Profile = () => import("../views/Profile.vue");
const Wallet = () => import("../views/Wallet.vue");
const Membership = () => import("../views/Membership.vue");
const Training = () => import("../views/Training.vue");
const Leaderboard = () => import("../views/Leaderboard.vue");
const Settings = () => import("../views/Settings.vue");
const About = () => import("../views/About.vue");
const Review = () => import("../views/Review.vue");

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: Login, meta: { public: true } },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { public: true },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPassword,
    meta: { public: true },
  },
  {
    path: "/update-password",
    name: "update-password",
    component: UpdatePassword,
    meta: { public: true },
  },
  {
    path: "/change-password",
    name: "change-password",
    component: ChangePassword,
  },
  {
    path: "/privacy-policy",
    name: "privacy-policy",
    component: PrivacyPolicy,
    meta: { public: true },
  },
  {
    path: "/terms-of-service",
    name: "terms-of-service",
    component: TermsOfService,
    meta: { public: true },
  },
  {
    path: "/data-disclaimer",
    name: "data-disclaimer",
    component: DataDisclaimer,
    meta: { public: true },
  },
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", name: "home", component: Home, meta: { title: "Dashboard" } },
      {
        path: "training",
        name: "training",
        component: Training,
        meta: { title: "Training Simulation" },
      },
      {
        path: "review",
        name: "review",
        component: Review,
        meta: { title: "Performance Review" },
      },
      {
        path: "leaderboard",
        name: "leaderboard",
        component: Leaderboard,
        meta: { title: "Leaderboard" },
      },
      {
        path: "wallet",
        name: "wallet",
        component: Wallet,
        meta: { title: "My Wallet" },
      },
      {
        path: "membership",
        name: "membership",
        component: Membership,
        meta: { title: "Membership & Achievements" },
      },
      {
        path: "profile",
        name: "profile",
        component: Profile,
        meta: { title: "Profile" },
      },
      {
        path: "settings",
        name: "settings",
        component: Settings,
        meta: { title: "Settings" },
      },
      {
        path: "about",
        name: "about",
        component: About,
        meta: { title: "About" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (
      to.meta.public &&
      session &&
      (to.name === "login" ||
        to.name === "register" ||
        to.name === "forgot-password")
    ) {
      next({ name: "home" });
      return;
    }

    if (!to.meta.public && !session) {
      next({ name: "login" });
      return;
    }

    next();
  } catch (error) {
    console.error("Router Guard Error:", error);
    if (!to.meta.public) {
      next({ name: "login" });
    } else {
      next();
    }
  }
});

export default router;
