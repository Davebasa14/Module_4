// Manual Hash Bucket Node for Linked List Collision Chaining
class HashNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
    }
}

// Custom HashMap Implementation (O(1) average lookup/insertion)
class ManualHashMap {
    constructor(capacity = 32) {
        this.capacity = capacity;
        this.buckets = new Array(capacity);
        for (let i = 0; i < capacity; i++) {
            this.buckets[i] = null;
        }
        this.size = 0;
    }

    // djb2 Hashing Algorithm
    _hash(key) {
        let str = String(key);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash) % this.capacity;
    }

    put(key, value) {
        let index = this._hash(key);
        let current = this.buckets[index];

        while (current !== null) {
            if (current.key === key) {
                current.value = value;
                return;
            }
            current = current.next;
        }

        let newNode = new HashNode(key, value);
        newNode.next = this.buckets[index];
        this.buckets[index] = newNode;
        this.size++;
    }

    get(key) {
        let index = this._hash(key);
        let current = this.buckets[index];
        while (current !== null) {
            if (current.key === key) {
                return current.value;
            }
            current = current.next;
        }
        return null;
    }

    has(key) {
        return this.get(key) !== null;
    }
}

// Category Node for Tree Structure
class CategoryNode {
    constructor(id, name, parent = null) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.children = [];
        this.products = [];
    }

    addChild(childNode) {
        this.children[this.children.length] = childNode;
        childNode.parent = this;
    }

    addProduct(product) {
        this.products[this.products.length] = product;
    }
}

// Category Tree Manager
class CategoryTree {
    constructor() {
        this.root = new CategoryNode("CAT-ROOT", "Root Category", null);
    }
}

// Global Memory Instantiations
const categoryTree = new CategoryTree();
const categoryHashMap = new ManualHashMap();
const productHashMap = new ManualHashMap();

let categoryCounter = 1;
let productCounter = 1;

// Manual String Helpers (Avoiding prohibited built-ins like split, trim, indexOf)
function manualTrim(str) {
    let start = 0;
    let end = str.length - 1;
    while (start <= end && str.charCodeAt(start) <= 32) {
        start++;
    }
    while (end >= start && str.charCodeAt(end) <= 32) {
        end--;
    }
    let res = "";
    for (let i = start; i <= end; i++) {
        res += str[i];
    }
    return res;
}

function manualSplitPath(pathStr) {
    let parts = [];
    let currentPart = "";
    for (let i = 0; i < pathStr.length; i++) {
        let char = pathStr[i];
        if (char === '>') {
            let trimmed = manualTrim(currentPart);
            if (trimmed.length > 0) {
                parts[parts.length] = trimmed;
            }
            currentPart = "";
        } else {
            currentPart += char;
        }
    }
    let trimmedLast = manualTrim(currentPart);
    if (trimmedLast.length > 0) {
        parts[parts.length] = trimmedLast;
    }
    return parts;
}

// Core Upsert & Product Registration Algorithm
function registerProductAndCategory(inputData) {
    const pathParts = manualSplitPath(inputData.categoryPath);
    if (pathParts.length === 0) {
        return { success: false, message: "Category path cannot be empty." };
    }

    let currentParent = categoryTree.root;
    let targetCategoryNode = null;
    let executionLogs = [];

    // STEP 1 & STEP 2: Category Upsert (Find-or-Create) & Tree Attachment
    for (let i = 0; i < pathParts.length; i++) {
        let catName = pathParts[i];
        let existingCategory = categoryHashMap.get(catName);

        if (existingCategory !== null) {
            targetCategoryNode = existingCategory;
            executionLogs[executionLogs.length] = `Category '${catName}' found in Category Hash Map (Existing ID: ${targetCategoryNode.id}).`;
        } else {
            let newId = "CAT-" + String(categoryCounter);
            categoryCounter++;

            targetCategoryNode = new CategoryNode(newId, catName, currentParent);
            currentParent.addChild(targetCategoryNode);
            categoryHashMap.put(catName, targetCategoryNode);

            executionLogs[executionLogs.length] = `Category '${catName}' NOT found. Instantiated CategoryNode [ID: ${newId}] and attached to parent '${currentParent.name}'.`;
        }
        currentParent = targetCategoryNode;
    }

    // STEP 3: Verify Product Code Uniqueness in Global Product Hash Map
    if (productHashMap.has(inputData.productCode)) {
        return {
            success: false,
            message: `Duplicate Error: Product Code '${inputData.productCode}' already exists in Global Product Hash Map.`
        };
    }

    // STEP 4: Instantiate Product Record
    let productId = "PROD-" + String(productCounter);
    productCounter++;

    const productRecord = {
        id: productId,
        code: inputData.productCode,
        name: inputData.productName,
        size: inputData.productSize,
        color: inputData.productColor,
        basePrice: parseFloat(inputData.basePrice),
        isAuthentic: inputData.authenticity,
        categoryId: targetCategoryNode.id,
        categoryName: targetCategoryNode.name
    };

    // STEP 5: Attach Product to Target Category Node & Global Product Hash Map
    targetCategoryNode.addProduct(productRecord);
    productHashMap.put(inputData.productCode, productRecord);

    return {
        success: true,
        logs: executionLogs,
        product: productRecord,
        category: targetCategoryNode
    };
}

// Tree Rendering (Pre-order Traversal)
function renderTreeView(node, indent = "") {
    let output = "";
    if (node.id !== "CAT-ROOT") {
        output += indent + "├── [Category ID: " + node.id + "] " + node.name + "\n";
        let prodIndent = indent + "│   ├── ";
        for (let i = 0; i < node.products.length; i++) {
            let p = node.products[i];
            output += prodIndent + "📦 [ID: " + p.id + "] " + p.name + " (SKU: " + p.code + ") | Size: " + p.size + " | ₱" + p.basePrice + " | " + p.isAuthentic + "\n";
        }
    }
    
    let childIndent = node.id === "CAT-ROOT" ? "" : indent + "│   ";
    for (let i = 0; i < node.children.length; i++) {
        output += renderTreeView(node.children[i], childIndent);
    }
    return output;
}

// Form Event Listener
document.getElementById("productForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const inputData = {
        categoryPath: document.getElementById("categoryPath").value,
        productCode: document.getElementById("productCode").value,
        productName: document.getElementById("productName").value,
        productSize: document.getElementById("productSize").value,
        productColor: document.getElementById("productColor").value,
        basePrice: document.getElementById("basePrice").value,
        authenticity: document.getElementById("authenticity").value
    };

    const result = registerProductAndCategory(inputData);
    const outputDiv = document.getElementById("outputContainer");
    outputDiv.innerHTML = "";

    if (!result.success) {
        outputDiv.innerHTML = "<p><strong>ERROR:</strong> " + result.message + "</p>";
        return;
    }

    // Generate Confirmation Output
    let logHtml = "<h3>Step-by-Step Execution Logs:</h3><ul>";
    for (let i = 0; i < result.logs.length; i++) {
        logHtml += "<li>" + result.logs[i] + "</li>";
    }
    logHtml += "</ul>";

    let productCardHtml = `
        <h3>Product Registration Card</h3>
        <table border="1" cellpadding="5">
            <tr><th>Attribute</th><th>Value</th></tr>
            <tr><td>Product ID</td><td>${result.product.id}</td></tr>
            <tr><td>Product Code (SKU)</td><td>${result.product.code}</td></tr>
            <tr><td>Product Name</td><td>${result.product.name}</td></tr>
            <tr><td>Assigned Category</td><td>${result.product.categoryName} (${result.product.categoryId})</td></tr>
            <tr><td>Size</td><td>${result.product.size}</td></tr>
            <tr><td>Color</td><td>${result.product.color}</td></tr>
            <tr><td>Base Price</td><td>₱${result.product.basePrice.toFixed(2)}</td></tr>
            <tr><td>Authenticity Flag</td><td>${result.product.isAuthentic}</td></tr>
        </table>
    `;

    outputDiv.innerHTML = logHtml + productCardHtml;
    document.getElementById("treeView").textContent = renderTreeView(categoryTree.root);

    // Reset Form Fields
    document.getElementById("productCode").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productSize").value = "";
    document.getElementById("productColor").value = "";
    document.getElementById("basePrice").value = "";
});