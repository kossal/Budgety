var budgetController = (function () {
    
    var Expense = function(id, description, value){
        this.id= id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = (this.value / totalIncome) * 100;
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(totalIncome) {
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id= id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current, index, array) {
            sum += current.value;
        });

        data.total[type] = sum;

    };

    return {
        addItem: function(type, des, val){

            var newItem, ID;

            //Create new ID based on the last ID of the list
            if (data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            
            return newItem;
        },
        removeItem: function(type, id){
            var index;

            index = data.allItems[type].map(function(current, index, array){
                if (current.id === id) {
                    return index;
                } 
            });
            
            data.allItems[type].splice(index, 1);

        },
        calculateBudget: function() {

            // Calculate total income and expenses´
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculat the budget: income - expenses
            data.budget = data.total.inc - data.total.exp;

            // Calculate percentage
            if (data.total.inc > 0){
                data.percentage = (data.total.exp / data.total.inc) * 100;
            } else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.total.inc);
            });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },
        testing: function() {
            return data;
        }
    };
    

})();

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type', 
        inputDescription: '.add__description', 
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list', 
        expensesContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function(num, type) {
        var int, dec, i;

        num = Math.abs(num);
        num = num.toFixed(2);
        num = num.split('.');

        int = num[0];
        dec = num[1];

        int = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        return (type === 'inc'? '+ ': '- ') + int + '.' + dec;

    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,// inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {

            var html, element;

            // Create HTML strings with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = `
                    <div class="item clearfix" id="inc-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${formatNumber(obj.value, type)}</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = `
                    <div class="item clearfix" id="exp-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${formatNumber(obj.value, type)}</div>
                            <div class="item__percentage"></div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            }

            //Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },
        removeItem: function(selectorID){
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArray[0].focus();

        },
        displayBudget: function(obj) {
            var type;

            obj.budget >= 0 ? type = 'inc': type = 'exp';
            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);

            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLable).textContent = Math.round(obj.percentage) + ' %';
            } else {
                document.querySelector(DOMstrings.percentageLable).textContent = '---';
            }

        },
        displayPercentages: function(perc) {
            var fields;

            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            fields.forEach(function(current, index, array){
                if (perc[index] !== -1) {
                    current.textContent = Math.round(perc[index]) + ' %';
                } else {
                    current.textContent = '---';
                }
                
            });

        },
        displayMonth: function(){
            var now, month, months, year;
            
            now = new Date();

            months = [
                'January', 'February','March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changeType: function() {

            var list = document.querySelectorAll(DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue + ',' + DOMstrings.inputType);

            list.forEach( function(curr){
                curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function(){
            return DOMstrings;
        } 
    };

})();

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' || event.wich === 13 || event.keyCode === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function() {
        var budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return  the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
       var percentages = budgetCtrl.getPercentages();

        // 3. Update UI
        UICtrl.displayPercentages(percentages);

    };
    
    var ctrlAddItem = function() {
        var input;

        // 1. Get field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            var newItem;

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Update Percentages
            updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            // 1. Remove item
            UICtrl.removeItem(itemID);

            // 2. Remove object
            budgetCtrl.removeItem(type, id);

            // 3. Update Budget
            updateBudget();

            // 4. Update percentages
            updatePercentages();

        }
    };

    return {
        init: function(){
            setupEventListeners();

            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    };

})(budgetController, UIController);

controller.init();

