<template>
	<div class="orders">
		<!-- Search input -->
		<div class="search-bar">
			<label class="search-bar-label">Search:</label>
			<input
				type="text"
				placeholder="type order or product name"
				v-model="searchQuery"
				@input="debouncedFetchOrders"
				@keyup.enter="fetchOrders"
			/>
			<button :id="searchQuery ? 'clear-button' : 'clear-button-hide'" @click="clearSearch">Clear</button>
		</div>

		<!-- Date Filters -->
		<div class="date-filters">
			<h3 class="date-filters-header">Created Date</h3>
			<div class="date-container">
				<label for="start-date" class="date-label">Start Date:</label>
				<input type="date" id="start-date" class="date-input" v-model="startDate" @change="fetchOrders" />
				<button :id="startDate ? 'clear-button' : 'clear-button-hide'" @click="clearStartDate">Clear</button>
			</div>

			<div class="date-container">
				<label for="end-date" class="date-label">End Date:</label>
				<input type="date" id="end-date" class="date-input" v-model="endDate" @change="fetchOrders" />
				<button :id="endDate ? 'clear-button' : 'clear-button-hide'" @click="clearEndDate">Clear</button>
			</div>
		</div>

		<div class="total-amount" v-if="orders.length > 0">Total amount: {{ formatCurrency(totalAmount) }}</div>

		<!-- Orders Table -->
		<div id="table-view">
			<table v-if="orders.length > 0">
				<thead>
					<tr>
						<th>Order name</th>
						<th>Customer Company</th>
						<th>Customer name</th>
						<th>Order date</th>
						<th>Delivered Amount</th>
						<th>Total Amount</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="order in orders" :key="order.ID">
						<td>
							<p>{{ order.order_name }}</p>
							<p id="products-name">{{ getProductName(order) }}</p>
						</td>
						<td>{{ order.customer.company.company_name }}</td>
						<td>{{ order.customer.name }}</td>
						<td>{{ formatDate(order.CreatedAt) }}</td>
						<td>{{ formatCurrency(order.delivered_amount) }}</td>
						<td>{{ formatCurrency(order.total_amount) }}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- No Data Found Message -->
		<div v-if="orders.length === 0" class="no-data">No data found</div>

		<!-- Pagination and Page Navigation -->
		<div class="pagination-controls">
			<div class="pagination">
				<button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">←</button>
				<span>Page {{ currentPage }} of {{ totalPages }}</span>
				<button :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">→</button>
			</div>
			<div class="page-navigation">
				<span>Go to</span>
				<input type="text" v-model="goToPage" @keyup.enter="goToSpecificPage" />
			</div>
		</div>
	</div>
</template>

<script>
import axios from "axios";

function debounce(fn, delay) {
	let timeoutID = null;
	return function (...args) {
		clearTimeout(timeoutID);
		timeoutID = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
}

export default {
	data() {
		return {
			orders: [],
			searchQuery: "",
			startDate: "",
			endDate: "",
			currentPage: 1,
			totalPages: 0,
			goToPage: 1,
			totalAmount: 0,
			debouncedFetchOrders: null,
		};
	},

	methods: {
		async fetchOrders(resetPage = false) {
			if (resetPage) this.currentPage = 1;
			let url = `http://localhost:8080/orders?page=${this.currentPage}`;

			if (this.searchQuery) {
				const encodedQuery = encodeURIComponent(this.searchQuery);
				url += `&order_name=${encodedQuery}`;
			}

			if (this.startDate) {
				url += `&startDate=${this.startDate}`;
			}
			if (this.endDate) {
				url += `&endDate=${this.endDate}`;
			}

			try {
				const response = await axios.get(url);
				this.orders = response.data.data;
				this.totalPages = response.data.total_page;
				this.calculateTotalAmountGlobal();
			} catch (error) {
				console.error(error);
			}
		},

		calculateTotalAmountGlobal() {
			this.totalAmount = this.orders.reduce((acc, order) => acc + order.total_amount, 0);
		},

		getProductName(order) {
			const products = order.order_items.map(item => {
				return item.product;
			});

			return products.join(", ");
		},

		changePage(page) {
			if (page >= 1 && page <= this.totalPages) {
				this.currentPage = page;
				this.fetchOrders(false);
			}
		},

		goToSpecificPage() {
			const page = Math.max(1, Math.min(this.totalPages, this.goToPage));
			this.changePage(page);
		},

		clearSearch() {
			this.searchQuery = "";
			this.fetchOrders(true);
		},

		clearStartDate() {
			this.startDate = "";
			this.fetchOrders(true);
		},

		clearEndDate() {
			this.endDate = "";
			this.fetchOrders(true);
		},

		formatDate(dateString) {
			const date = new Date(dateString);
			const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
			let formattedDate = date.toLocaleString("en-US", options);

			const day = date.getDate();
			formattedDate = formattedDate.replace(day, this.getDayWithSuffix(day));

			formattedDate = formattedDate.replace(/,/, " ");

			return formattedDate;
		},

		getDayWithSuffix(day) {
			if (day > 3 && day < 21) return day + "th";
			switch (day % 10) {
				case 1:
					return day + "st";
				case 2:
					return day + "nd";
				case 3:
					return day + "rd";
				default:
					return day + "th";
			}
		},

		formatCurrency(amount) {
			if (amount === 0) return "-";
			return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
		},
	},

	watch: {
		currentPage(newVal) {
			this.goToPage = newVal;
		},
	},

	created() {
		this.debouncedFetchOrders = debounce(this.fetchOrders, 750);
	},

	mounted() {
		this.fetchOrders(false);
	},
};
</script>

<style>
#clear-button {
	margin-left: 10px;
}

#clear-button-hide {
	margin-left: 10px;
	display: none;
}

.orders {
	max-width: 1200px;
	margin: 20px auto;
	background: #fff;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-bar {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 20px;
}

.search-bar-label {
	margin-right: 8px;
}

.search-bar input[type="text"] {
	width: 100%;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 16px;
}

.date-filters {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 20px;
}

.date-filters-header {
	margin: 0px;
}

.date-label {
	font-weight: 500;
	color: #333;
	margin-right: 10px;
}

.date-input {
	padding: 4px;
	margin-bottom: 10px;
	border: 1px solid #ccc;
	border-radius: 4px;
	font-size: 16px;
}

.total-amount {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 20px;
}

table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

p {
	margin: 4px 0px;
}

#products-name {
	font-size: 14px;
	color: #525252;
}

th,
td {
	padding: 12px;
	text-align: left;
	border-bottom: 1px solid #ddd;
}

th {
	background-color: #eee;
	color: #333;
}

tr:hover {
	background-color: #f5f5f5;
}

.pagination-controls {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
	flex-direction: row;
}

.pagination,
.page-navigation {
	width: 15%;
	justify-content: center;
	display: flex;
	margin-bottom: 10px;
}

.pagination button {
	background-color: #5c6bc0;
	color: white;
	border: none;
	padding: 5px 10px;
	margin: 0 5px;
	border-radius: 4px;
	cursor: pointer;
}

.pagination button:disabled {
	background-color: #9fa8da;
	cursor: not-allowed;
}

.page-navigation input {
	border: 1px solid #ddd;
	padding: 5px 10px;
	width: 50px;
	border-radius: 4px;
	text-align: center;
}

.no-data {
	text-align: center;
	padding: 20px;
	color: #666;
}

@media (max-width: 768px) {
	.search-bar,
	.date-filters,
	.pagination-controls,
	.page-navigation {
		flex-direction: column;
		align-items: stretch;
	}

	.search-bar {
		gap: 10px;
	}

	.search-bar input[type="text"],
	.date-input {
		width: calc(100% - 20px);
		margin-bottom: 10px;
	}

	.search-bar button,
	.pagination button,
	.date-container button {
		width: auto;
		padding: 10px;
		margin-top: 10px;
	}

	.date-container {
		flex-direction: column;
	}

	.date-label {
		margin-bottom: 5px;
	}

	.pagination-controls,
	.pagination,
	.page-navigation {
		width: 100%;
		margin-top: 20px;
	}

	.pagination span,
	.page-navigation span {
		text-align: center;
		width: 100%;
		margin-top: 10px;
	}

	.pagination button,
	.page-navigation input {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		margin-top: 10px;
	}

	.total-amount,
	.no-data {
		text-align: center;
	}

	table,
	th,
	td {
		font-size: 14px;
	}

	#products-name {
		font-size: 12px;
	}

	#table-view {
		overflow-x: scroll;
	}
}
</style>
