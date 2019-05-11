
var mysql = require("mysql");
var inquirer = require("inquirer");


const cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",

 
  port: 3306,

  user: "root",

  // password
  password: "RemyX",
  database: "bamazon_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected as id " + connection.threadId + "\n");
  saleitemDisplay();
});

// Display Sales Items
function saleitemDisplay() {
  connection.query("SELECT item_id as ID, product_name as Names , price as Prices FROM products", function (err, res) {
    if (err) throw err;

    // Log all results of the SELECT statement     
    console.log("THESE ARE ALL THE ITEMS AVAILABLE FOR SALE IN THE BAMAZON STORE\n");
    console.table(res);
    buyFromSalesTable();   
  });
}



function buyFromSalesTable() {
  inquirer
    .prompt([{
        type: "input",
        name: "item_id",
        message: "Please enter the ID of the product you would like to buy",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        type: "input",
        name: "quantity",
        message: "How many units would you like to buy?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function (input) {

      var item = input.item_id;
      var quantity = input.quantity;

     
      var queryStr = 'SELECT * FROM products WHERE ?';

      connection.query(queryStr, {item_id: item}, function(err, data) {
        if (err) throw err;  
  
        if (data.length === 0) {
          console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
          saleitemDisplay();
  
        } else {
          var productData = data[0];  
  
          // If the quantity requested by the user is in stock
          if (quantity <= productData.stock_quantity) {
            console.log('Congratulations, the product you requested is in stock! Placing order!');
  
            // Construct the updating query string
            var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
            // console.log('updateQueryStr = ' + updateQueryStr);
  
            // Update the inventory
            connection.query(updateQueryStr, function(err, data) {
              if (err) throw err;
  
              console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
              console.log('Thank you for shopping with us!');
              console.log("\n---------------------------------------------------------------------\n");
  
              // End the database connection
              connection.end();
            })
          } else {
            console.log('Sorry, there is not enough product in stock.');
            console.log('Please modify your order.');
            console.log("\n---------------------------------------------------------------------\n");
  
            saleitemDisplay();
          }
        }
      })
    })
  }

        