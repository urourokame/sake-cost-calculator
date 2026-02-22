document.addEventListener('DOMContentLoaded', () => {

    const inputs = document.querySelectorAll(
        '#cost-calculator input, #cost-calculator select'
    );

    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });


    // 容量ボタン
    setupButtonGroup('capacity-group', 'capacity');

    // 提供量ボタン
    setupButtonGroup('serving-group', 'serving-size');

    displayProducts();
});

function calculateAll() {

    const purchasePrice =
        parseFloat(document.getElementById('purchase-price').value) || 0;

    const shippingCost =
        parseFloat(document.getElementById('shipping-cost').value) || 0;

    const capacity =
        parseFloat(document.getElementById('capacity').value) || 0;

    const servingSizeValue =
        document.getElementById('serving-size').value;

    if (!capacity) return;

    const totalCost = purchasePrice + shippingCost;

    let costPerServing = 0;

    if (servingSizeValue === "bottle") {

        costPerServing = totalCost;

    } else {

        const servingSize = parseFloat(servingSizeValue);
        if (!servingSize) return;

        const totalServings = capacity / servingSize;

        if (totalServings <= 0) return;

        costPerServing =
            totalCost / totalServings;
    }

    document.getElementById('cost-per-serving').innerText =
        costPerServing.toFixed(2);

    document.getElementById('results').classList.remove('hidden');

    calculatePrices();
}

function calculatePrices() {

    const tens =
        parseInt(document.getElementById('cost-rate-tens').value) || 0;

    const ones =
        parseInt(document.getElementById('cost-rate-ones').value) || 0;

    const finalCostRate = tens * 10 + ones;

    document.getElementById('tens-value').innerText = tens;
    document.getElementById('ones-value').innerText = ones;
    document.getElementById('final-cost-rate').innerText = finalCostRate;
    document.getElementById('gross-margin-display').innerText = 100 - finalCostRate;

    const costPerServing =
        parseFloat(document.getElementById('cost-per-serving').innerText);

    // 原価がまだ出てない場合は止める
    if (isNaN(costPerServing)) return;

    // 原価率0%は計算しない
    if (finalCostRate <= 0) {
        document.getElementById('selling-price').innerText = "0";
        document.getElementById('gross-margin-price').innerText = "0";
        return;
    }

    const sellingPrice =
        costPerServing / (finalCostRate / 100);

    const grossMarginPrice =
        Math.round(sellingPrice - costPerServing);

    document.getElementById('gross-margin-price').innerText =
        grossMarginPrice.toLocaleString("ja-JP");

    document.getElementById('selling-price').innerText =
        Math.round(sellingPrice).toLocaleString("ja-JP");
}

function saveProduct() {

    const now = new Date();

    const capacityValue =
        document.getElementById('capacity')?.value || "";

    const servingValue =
        document.getElementById('serving-size')?.value || "";

    const product = {
        date: now.toLocaleString("ja-JP"),

        name: document.getElementById('product-name').value || "未入力",

        purchasePrice:
            document.getElementById('purchase-price').value,

        shippingCost:
            document.getElementById('shipping-cost').value,

        capacity: capacityValue,

        servingSize: servingValue === "bottle"
            ? "1本売り"
            : servingValue + "L",

        costPerServing:
            document.getElementById('cost-per-serving').innerText,

        costRate:
            document.getElementById('final-cost-rate').innerText,

        grossMarginPrice:
            document.getElementById('gross-margin-price').innerText,

        sellingPrice:
            document.getElementById('selling-price').innerText
    };

    let products =
        JSON.parse(localStorage.getItem('products')) || [];

    products.unshift(product);

    localStorage.setItem(
        'products',
        JSON.stringify(products)
    );

    displayProducts();
}

function deleteProduct(index) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    displayProducts();
}

function displayProducts() {

    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    let products = JSON.parse(localStorage.getItem('products')) || [];

    products.forEach((product, index) => {

        const li = document.createElement('li');

        li.innerHTML = `
            <div class="product-row">
                <div class="product-info">
                    <strong>${product.name} / ${product.capacity} / ${product.servingSize}</strong><br>
                    ${product.date}<br>
                    仕入:${product.purchasePrice}円 + 送料:${product.shippingCost}円<br>
                    原価率:${product.costRate}% / 粗利益:${product.grossMarginPrice}円<br>
                    <strong>販売価格: ￥${product.sellingPrice}</strong>
                </div>
                <button class="delete-btn" onclick="deleteProduct(${index})">
                    削除
                </button>
            </div>
        `;

        productList.appendChild(li);
    });
}

function setupButtonGroup(groupId, hiddenInputId) {

    const group = document.getElementById(groupId);
    const buttons = group.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {

            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // hidden input作る（計算用）
            let hiddenInput = document.getElementById(hiddenInputId);

            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.id = hiddenInputId;
                document.getElementById('cost-calculator')
                    .appendChild(hiddenInput);
            }

            hiddenInput.value = button.dataset.value;

            calculateAll();
        });
    });
}