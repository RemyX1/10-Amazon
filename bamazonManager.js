// USe node packages.
var inquirer = require("inquirer");
var mysql = require("mysql");


const cTable = require('console.table');

// mySql connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	
	user: "root",


	password: "RemyX",
	database: "bamazon_db"
});

// Menu options
function managerprompt() {

	
	inquirer.prompt([{
		type: "list",
		name: "option",
		message: "Please select an option:",
		choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
		filter: function (val) {
			if (val === "View Products for Sale") {
				return "sale";
			} else if (val === "View Low Inventory") {
				return "lowInventory";
			} else if (val === "Add to Inventory") {
				return "addInventory";
			} else if (val === "Add New Product") {
				return "newProduct";
			} else {
				
				console.table("ERROR: Unsupported operation!");
				exit(1);
			}
		}
	}]).then(function (input) {
		

		if (input.option === "sale") {
			displaySalesItems();
		} else if (input.option === "lowInventory") {
			displayLowInventory();
		} else if (input.option === "addInventory") {
			addInventory();
		} else if (input.option === "newProduct") {
			createNewProduct();
		} else {
			// This case should be unreachable
			console.log("ERROR: Unsupported operation!");
			exit(1);
		}
	})
}

// displaySalesItems will retrieve the current inventory from the database and output it to the console
function displaySalesItems() {

	// Construct the db query string
	queryStr = "SELECT item_id as ID, product_name as Names, department_name as Departments , price as Prices, stock_quantity as Quantities FROM products";

	// Make the db query
	connection.query(queryStr, function (err, data) {
		if (err) throw err;

		console.log('Existing Inventory: ');
		console.log('...................\n');

		console.table(data);

		console.log("---------------------------------------------------------------------\n");

		// End the database connection
		connection.end();
	})
}

// This fucntion will display a list of products where the quantity in stock is below 100
function displayLowInventory() {

	// Construct the db query string
	queryStr = "SELECT item_id as ID, product_name as Names, department_name as Departments , price as Prices, stock_quantity as Quantities FROM products WHERE stock_quantity < 100";

	// Make the db query
	connection.query(queryStr, function (err, data) {
		if (err) throw err;

		console.log('Low Inventory Items (below 100): ');
		console.log('................................\n');

		console.table(data);

		console.log("---------------------------------------------------------------------\n");

		// End the database connection
		connection.end();
	})
}

// This function makes sure that the user is supplying only positive integers
function validateInteger(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return "Please enter a whole non-zero number.";
	}
}

// This function makes sure that the user is supplying only positive numbers
function validateNumeric(value) {
	// Value must be a positive number
	var number = (typeof parseFloat(value)) === "number";
	var positive = parseFloat(value) > 0;

	if (number && positive) {
		return true;
	} else {
		return "Please enter a positive number for the unit price."
	}
}

// addInventory helps add more product
function addInventory() {

	// Prompt the user to select an item
	inquirer.prompt([{
			type: "input",
			name: "item_id",
			message: "Please enter the Item ID for the product update.",
			validate: validateInteger,
			filter: Number
		},
		{
			type: "input",
			name: "quantity",
			message: "How many would you like to add?",
			validate: validateInteger,
			filter: Number
		}
	]).then(function (input) {
		// console.log('Manager has selected: \n    item_id = '  + input.item_id + '\n    additional quantity = ' + input.quantity);

		var item = input.item_id;
		var addQuantity = input.quantity;

		// Query db to confirm that the given item ID exists and to determine the current stock_count
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {
			item_id: item
		}, function (err, data) {
			if (err) throw err;

			// If the user has selected an invalid item ID, data attay will be empty			

			if (data.length === 0) {
				console.log("ERROR: Invalid Item ID. Please select a valid Item ID.");
				addInventory();

			} else {
				var productData = data[0];

				console.log("Updating Inventory...");

				// Construct the updating query string
				var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + addQuantity) + ' WHERE item_id = ' + item;
				
				// Update the inventory
				connection.query(updateQueryStr, function (err, data) {
					if (err) throw err;

					console.log("Stock count for Item ID " + item + " has been updated to " + (productData.stock_quantity + addQuantity) + ".");
					console.log("\n---------------------------------------------------------------------\n");

					// End the database connection
					connection.end();
				})
			}
		})
	})
}

// createNewProduct will guide the user in adding a new product to the inventory
function createNewProduct() {
	// console.log('___ENTER createNewProduct___');

	// Prompt the user to enter information about the new product
	inquirer.prompt([{
			type: 'input',
			name: 'product_name',
			message: 'Please enter the new product name.',
		},
		{
			type: 'input',
			name: 'department_name',
			message: 'Which department does the new product belong to?',
		},
		{
			type: 'input',
			name: 'price',
			message: 'What is the price per unit?',
			validate: validateNumeric
		},
		{
			type: 'input',
			name: 'stock_quantity',
			message: 'How many items are in stock?',
			validate: validateInteger
		}
	]).then(function (input) {

		console.log('Adding New Item: \n    product_name = ' + input.product_name + '\n' +
			'    department_name = ' + input.department_name + '\n' +
			'    price = ' + input.price + '\n' +
			'    stock_quantity = ' + input.stock_quantity);
		// Grabbing the last ID from the database
			var queryStr1 = 'SELECT * FROM products ORDER BY item_id DESC LIMIT 1';

			connection.query(queryStr1, function (error, results, fields) {
				if (error) throw error;
				// console.log(results[0].item_id);
				addProduct(input, results[0].item_id);
			});
	})
}
function addProduct(input, itemID){
	// var newItem_id = itemID + 1;
	// Insert newItem_id into input

	input.item_id = ++itemID;

	// console.log(input);
	// console.log('last ItemID ' + itemID);
	// Create the insertion query string
	var queryStr = 'INSERT INTO products SET ?';
	// Add new product to the db
	connection.query(queryStr, input, function (error, results, fields) {
		if (error) throw error;

		console.log('New product has been added to the inventory under Item ID ' + input.item_id + '.');
		console.log("\n---------------------------------------------------------------------\n");
		// End the database connection
		connection.end();
	});
}
// runBamazon will execute the main application logic
function runBamazon() {
	// console.log('___ENTER runBamazon___');

	// Prompt manager for input
	managerprompt();
}

// Run the application logic
runBamazon();