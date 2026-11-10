const qaItems = [
    {
        question: "How do I track my package?",
        answer:
            "You can easily track your package using our online tracking system. Simply enter your tracking number on our website to get real-time updates on your delivery's status.",
    },
    {
        question: "What should I do if my package is damaged or lost?",
        answer:
            "If your package arrives damaged or is lost in transit, please contact us immediately. We will investigate the matter and arrange for a replacement or refund as per our policy.",
    },
    {
        question: "Can I change my delivery address after placing an order?",
        answer:
            "Yes, you can change your delivery address as long as the package has not been dispatched. Please contact our customer service team as soon as possible to make any changes.",
    },
    {
        question: "Are there any items that cannot be shipped?",
        answer:
            "Yes, there are certain restrictions on items that can be shipped due to safety and legal reasons. Please refer to our shipping policy or contact us for more information on prohibited items.",
    },
];
const accordionDiv = document.getElementById("accordion")
qaItems.forEach(qaItems => {
    const questionText = qaItems.question
    const answerText = qaItems.answer
    const questionDiv = document.createElement("div")
    questionDiv.classList.add("accordion-question")
    questionDiv.textContent = questionText

    const answerDiv = document.createElement("div")
    answerDiv.classList.add("accordion-answer")
    answerDiv.textContent = answerText

    questionDiv.appendChild(answerDiv)

    questionDiv.addEventListener("click", () => {
        questionDiv.classList.toggle("active")
        answerDiv.classList.toggle("active")
    })
    accordionDiv.appendChild(questionDiv)
})
class DatabaseObject{
    toString(){
        throw new Error("not implemented")
    }
}
class Product extends DatabaseObject{
    constructor(name, inventory){
        super();
        this.name = name
        this.inventory = inventory
    }
    toString(){
        return `${this.name}: ${this.inventory} left in stock`
    }
    static create(productData){
        const {name, inventory} = productData
        return new Product(name, inventory)
    }
}
class Delivery extends DatabaseObject{
    constructor(params){
        super()
        const {address, scheduledTime, product, quantity} = params
        this.address = address
        this.scheduledTime = scheduledTime
        this.product = product
        this.quantity = quantity
    }
    toString(){
        return `Delivering ${this.quantity} of ${this.product.name} to ${this.address} at ${this.scheduledTime}`
    }
    static create(params){
        //const {address, scheduledTime, product, quantity} = params
        //return new Delivery(address, scheduledTime, product, quantity)
        return new Delivery(params)
    }
}
class ProductDao{
    static seeds = [
        {
            name: "Apples",
            inventory: 100
        },
        {
            name: "Bananas",
            inventory: 90
        },
        {
            name: "Peaches",
            inventory: 70
        }
    ]
    getAll(){
        throw new Error("not implemented")
    }
    ProductByName(name){
        throw new Error("not implemented")
    }
    dateOfProduct(){
        throw new Error("not implemented")
    }
}
class sessionStorageProductDao extends ProductDao{
    constructor(){
        super()
        this.database = sessionStorage
    }
    getAll(){
        const productAsJSON = this.database.getItem("products")
        const productsData = productAsJSON ? JSON.parse(productAsJSON) : ProductDao.seeds
        return productsData.map((productsData) => {
            const {name, inventory} = productsData
            return new Product(name, inventory)
        })
    }
    ProductByName(name){
        const products = this.getAll()
        return products.find((product) => product.name == name)
    }
    update(product){
        const existingProducts = this.getAll()
        const indexToDelete = existingProducts.findIndex(productInList => productInList.name == product.name)
        existingProducts.splice(indexToDelete, 1, product)
        this.database.setItem("products", JSON.stringify(existingProducts))
    }
}
class CookieStorageProductDAO extends ProductDao{
    constructor(){
        super()
        this.database = document.cookie
    }
    getAll() {
        const existingCookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("products"))
        ?.split("=")[1]
        
    const productsData = existingCookieValue ? JSON.parse(existingCookieValue):ProductDao.seeds
    return productsData.map((productData) => new Product(productData.name, productData.inventory))
    }
    ProductByName(name){
        const products = this.getAll()
        return products.find((product) => product.name == name)
    }
    update(product){
        const existingProducts = this.getAll()
        const indexToDelete = existingProducts.findIndex(productInList => productInList.name == product.name)
        existingProducts.splice(indexToDelete, 1, product)
        document.cookie = `products=${JSON.stringify(existingProducts)};`;
    }
}
class deliveryDAO{
    getAll(){
        throw new Error("not implemented")
    }
    create(){
        throw new Error("not yet implemented")
    }
}
class sessionStorageDeliveryDAO extends deliveryDAO{
    constructor() {
    super();
    this.database = sessionStorage;
  }

  getAll() {
    const deliveriesListJSON = this.database.getItem("deliveries");
    const listOfDeliveryJSON = deliveriesListJSON
      ? JSON.parse(deliveriesListJSON)
      : [];

    return listOfDeliveryJSON.map((deliveryJSON) =>
      Delivery.create(deliveryJSON)
    );
  }

  create(delivery) {
    const deliveryList = this.getAll();
    deliveryList.push(delivery);

    this.database.setItem("deliveries", JSON.stringify(deliveryList));
  }
}
class CookieStorageDeliveryDAO extends deliveryDAO{
    constructor(){
        super()
        this.database = document.cookie
    }
    create(deliveryData){
        const existingDeliveries = this.getAll()
        existingDeliveries.push(deliveryData)
        console.log(deliveryData)
        console.log(existingDeliveries)
        document.cookie = `deliveries=${JSON.stringify(existingDeliveries)};`
        if(!document.cookie){
            console.log("ahhhhhh")
        }
    }
    getAll() {
        const existingCookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith("deliveries"))
          ?.split("=")[1]

        const deliveriesData = existingCookieValue ? JSON.parse(existingCookieValue) : []
        return deliveriesData.map((deliveriesData) => new Delivery(deliveriesData))
    }
}
class CreateDeliveryService{
    constructor(productDao, deliveryDao){
        this.productDao = productDao
        this.deliveryData = deliveryDao
    }
    CreateDelivery(productName, quantity, address, scheduledTime){
        const product = productDao.ProductByName(productName)
        const newInventory = product.inventory - quantity
        product.inventory = newInventory
        const deliveryData = {
            product,
            quantity,
            address,
            scheduledTime
        }
        console.log("creating delivery")
        deliveryDao.create(deliveryData)
        productDao.update(product)
    }
}
const deliveryDao = new CookieStorageDeliveryDAO()
const productDao = new CookieStorageProductDAO()
const createDeliveryService = new CreateDeliveryService(productDao, deliveryDao)
const deliverylist = document.getElementById("deliveries-list")
const deliveries = deliveryDao.getAll()
for(let i = 0; i < deliveries.length; i++){
    const delivery = deliveries[i]
    const deliveryLi = document.createElement("li")
    deliveryLi.textContent = delivery.toString()
    deliverylist.appendChild(deliveryLi)
}

const productNameSelect = document.querySelector("#deliveries form select")
const products = productDao.getAll()
for (let i = 0; i < products.length; i++) {
    const quantityInput = document.querySelector("#deliveries form input[name='quantity']")
    const product = products[i];
    const option = document.createElement("option")
    option.innerText = product.toString()
    option.setAttribute("value", product.name)
    const existingInventory = product.inventory
    if(i == 0){
        quantityInput.setAttribute("max", existingInventory)
    }
    if(existingInventory > 0){
        productNameSelect.appendChild(option)
    }
}
function handleChangeToProductName(event){
    const quantityInput = document.querySelector("#deliveries form input[name='quantity']")
    const productName = event.target.value
    const selectedProduct = productDao.ProductByName(productName)
    const existingInventory = selectedProduct.inventory
    quantityInput.setAttribute("max", event)
}
productNameSelect.addEventListener("change", handleChangeToProductName)
const createdeliveryForm = document.querySelector("#deliveries form")
createdeliveryForm.addEventListener("submit", (event) => {
    const formData = new FormData(event.target)
    event.preventDefault()
    const address = formData.get("address")
    const scheduledTime = formData.get("scheduledTime")
    const productName = formData.get("productName")
    const quantity = formData.get("quantity")
    createDeliveryService.CreateDelivery(productName, quantity, address, scheduledTime)
})
