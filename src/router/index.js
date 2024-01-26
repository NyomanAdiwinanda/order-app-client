import { createRouter, createWebHistory } from "vue-router";
import OrdersView from "../views/OrdersView.vue";

const routes = [
	{
		path: "/",
		redirect: "/orders",
	},
	{
		path: "/orders",
		name: "Orders",
		component: OrdersView,
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/orders",
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
