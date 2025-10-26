const invoiceEl = document.getElementById('invoice');
const invoiceNumberEl = document.getElementById('invoiceNumber');
const companyInfoEl = document.getElementById('companyInfo');
const clientInfoEl = document.getElementById('clientInfo');
const accountNameEl = document.getElementById('accountName');
const accountNumberEl = document.getElementById('accountNumber');
const addItemBtn = document.getElementById('addItem');
const downloadBtn = document.getElementById('downloadPDF');
const themeSelector = document.getElementById('themeSelector');
const logoUploadEl = document.getElementById('logoUpload');

let items = [];
let logoDataURL = "";
const themeColors = {
  teal: '#0d9488',
  classic: '#1e3a8a',
  gray: '#374151',
  purple: '#8b5cf6',
  gold: '#d97706',
  green: '#16a34a'
};

// Upload logo
logoUploadEl.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(event){ 
      logoDataURL = event.target.result; 
      updateInvoice(); 
    }
    reader.readAsDataURL(file);
  }
});

function renderTable(){
  const tbody = document.getElementById('invoiceItems');
  tbody.innerHTML = '';
  items.forEach((item, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-2 w-1/2"><input data-index="${idx}" data-field="description" value="${item.description}" class="w-full border rounded p-1 text-sm"></td>
      <td class="border p-2 text-right w-1/6"><input data-index="${idx}" data-field="qty" type="number" value="${item.qty}" class="w-full border rounded p-1 text-sm text-right"></td>
      <td class="border p-2 text-right w-1/6"><input data-index="${idx}" data-field="rate" type="number" value="${item.rate}" class="w-full border rounded p-1 text-sm text-right"></td>
      <td class="border p-2 text-right w-1/6 amount-cell">${(item.qty*item.rate||0).toFixed(2)}</td>
      <td class="border p-2 text-center"><button data-action="remove" data-index="${idx}" class="text-red-500">x</button></td>
    `;
    tbody.appendChild(tr);
  });
  updateInvoice();
}

function updateInvoice(){
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();
  const theme = themeSelector.value;

  invoiceEl.className = `max-w-7xl mx-auto my-10 p-10 bg-white shadow rounded-md transition-all duration-300 theme-${theme}`;
  
  invoiceEl.innerHTML = `
    <div class="invoice-header">
      <div>
        ${logoDataURL ? `<img src="${logoDataURL}" class="invoice-logo">` : ''}
        <h1 class="invoice-title text-theme">INVOICE</h1>
      </div>
      <div class="text-right">
        <div class="font-semibold text-gray-700">Date: ${new Date().toLocaleDateString()}</div>
        <div class="font-semibold text-gray-700">Invoice No: ${invoiceNumberEl.value}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-8 mt-6">
      <div>
        <h3 class="font-semibold text-gray-700 mb-1">From:</h3>
        <p class="whitespace-pre-line text-sm">${companyInfoEl.value}</p>
      </div>
      <div>
        <h3 class="font-semibold text-gray-700 mb-1">Bill To:</h3>
        <p class="whitespace-pre-line text-sm">${clientInfoEl.value}</p>
      </div>
    </div>

    <table class="w-full border border-gray-300 text-sm mb-6 theme-table">
      <thead>
        <tr>
          <th class="p-2 text-left w-1/2">Description</th>
          <th class="p-2 text-right w-1/6">Qty</th>
          <th class="p-2 text-right w-1/6">Rate</th>
          <th class="p-2 text-right w-1/6">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(i=>`<tr>
          <td class="border p-2">${i.description}</td>
          <td class="border p-2 text-right">${i.qty}</td>
          <td class="border p-2 text-right">${i.rate}</td>
          <td class="border p-2 text-right">${(i.qty*i.rate||0).toFixed(2)}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div class="flex justify-end w-56 ml-auto mb-6 totals p-2 rounded">
      <div class="text-right w-full">
        <div class="flex justify-between mb-1"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
        <div class="flex justify-between mb-1"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>
        <div class="border-t mt-2 pt-2 font-bold flex justify-between text-lg"><span>Total:</span><span>${total.toFixed(2)}</span></div>
      </div>
    </div>

    <div class="border rounded-md p-3 bg-gray-50 w-72 text-sm mt-4">
      <h3 class="font-semibold text-gray-700 mb-1">Account Details:</h3>
      <p>${accountNameEl.value}</p>
      <p>Account Number: ${accountNumberEl.value}</p>
    </div>

    <div class="mt-8 text-center text-gray-500 text-xs">Thank you for your business!</div>
  `;
  
  invoiceEl.querySelector('.text-theme').style.color = themeColors[theme];
  invoiceEl.querySelector('thead').style.backgroundColor = themeColors[theme];
  invoiceEl.querySelector('thead').style.color = '#fff';
}

function calculateSubtotal(){ return items.reduce((sum,i)=>sum+(i.qty*i.rate||0),0); }
function calculateTax(){ return calculateSubtotal() * (Number(document.getElementById('taxRate').value)||0)/100; }
function calculateTotal(){ return calculateSubtotal() + calculateTax(); }

addItemBtn.addEventListener('click', ()=>{ items.push({description:'', qty:0, rate:0}); renderTable(); });
document.addEventListener('click', e=>{ if(e.target.dataset.action==='remove'){ items.splice(Number(e.target.dataset.index),1); renderTable(); } });

document.addEventListener('input', e=>{
  const t=e.target;
  if(t.dataset.index && t.dataset.field){ items[Number(t.dataset.index)][t.dataset.field]=t.value; updateInvoice(); }
  if(['companyInfo','clientInfo','accountName','accountNumber','invoiceNumber','taxRate'].includes(t.id)) updateInvoice();
});

themeSelector.addEventListener('change', updateInvoice);

downloadBtn.addEventListener('click', ()=>{
  html2pdf().set({
    margin:0.2,
    filename:`Invoice_${invoiceNumberEl.value||'000'}.pdf`,
    image:{type:'jpeg', quality:1},
    html2canvas:{scale:2},
    jsPDF:{unit:'in', format:'letter', orientation:'portrait'}
  }).from(invoiceEl).save();
});

renderTable();
updateInvoice();
themeSelector.dispatchEvent(new Event('change'));