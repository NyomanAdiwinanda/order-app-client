<template>
	<OrdersView />
</template>

<script>
import OrdersView from "./views/OrdersView.vue";

export default {
	name: "App",
	components: {
		OrdersView,
	},
};
</script>

<style>
* {
	box-sizing: border-box;
}

body {
	font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
	margin: 0;
	padding: 0;
	background: #f4f4f4;
}
</style>
