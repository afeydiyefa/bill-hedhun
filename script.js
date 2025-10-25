// Elements
const themeSelector = document.getElementById('themeSelector');
const invoiceEl = document.getElementById('invoice');
const invoiceItemsTbody = document.getElementById('invoiceItems');
const addItemBtn = document.getElementById('addItem');

const companyInfoEl = document.getElementById('companyInfo');
const clientInfoEl = document.getElementById('clientInfo');
const accountNameEl = document.getElementById('accountName');
const accountNumberEl = document.getElementById('accountNumber');
const invoiceNumberEl = document.getElementById('invoiceNumber');
const taxRateEl = document.getElementById('taxRate');
const subtotalEl = document.getElementById('subtotal');
const totalEl = document.getElementById('total');

const previewCompanyInfo = document.getElementById('previewCompanyInfo');
const previewClientInfo = document.getElementById('previewClientInfo');
const previewAccountName = document.getElementById('previewAccountName');
const previewAccountNumber = document.getElementById('previewAccountNumber');
const previewInvoiceNumber = document.getElementById('previewInvoiceNumber');
const previewItemsTbody = document.getElementById('previewItems');
const previewSubtotal = document.getElementById('previewSubtotal');
const previewTax = document.getElementById('previewTax');
const previewTotal = document.getElementById('previewTotal');

const downloadBtn = document.getElementById('downloadPDF');
const invoiceDateEl = document.getElementById('invoiceDate');
const previewTable = document.getElementById('previewTable');

// Set today's date DD/MM/YYYY
const now = new Date();
invoiceDateEl.textContent = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

// Invoice items array
let items = [{description:'', qty:'', rate:''}];

// Theme colors
const themeColors = {
  modern: '#0d9488',
  classic: '#2563eb',
  gray: '#4b5563',
  purple: '#7c3aed',
  gold: '#d4af37',
  green: '#10b981'
};

// Helper functions
const toNum = v => isFinite(parseFloat(v)) ? parseFloat(v) : 0;
const money = n => n.toFixed(2);

// Render invoice items table
function renderTable(){
  invoiceItemsTbody.innerHTML = '';
  items.forEach((it,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
<td class="p-2 w-2/3"><textarea data-index="${i}" data-field="description">${it.description}</textarea></td>
<td class="p-2 text-right"><input type="number" data-index="${i}" data-field="qty" value="${it.qty}"></td>
<td class="p-2 text-right"><input type="number" data-index="${i}" data-field="rate" value="${it.rate}"></td>
<td class="p-2 text-right" id="amount-${i}">0.00</td>
<td class="p-2 text-center"><button data-action="remove" data-index="${i}" class="text-red-600">✕</button></td>
`;
    invoiceItemsTbody.appendChild(tr);
  });
}

// Update invoice preview and calculations
function updateInvoice(){
  let subtotal = 0;
  previewItemsTbody.innerHTML = '';

  items.forEach((it,i)=>{
    const qty = toNum(it.qty);
    const rate = toNum(it.rate);
    const amt = qty * rate;
    subtotal += amt;

    const amountCell = document.getElementById(`amount-${i}`);
    if(amountCell) amountCell.textContent = money(amt);

    const tr = document.createElement('tr');
    tr.innerHTML = `
<td class="p-2">${it.description}</td>
<td class="p-2 text-right">${qty}</td>
<td class="p-2 text-right">${money(rate)}</td>
<td class="p-2 text-right">${money(amt)}</td>`;
    previewItemsTbody.appendChild(tr);
  });

  const tax = subtotal * toNum(taxRateEl.value) / 100;
  const total = subtotal + tax;

  subtotalEl.textContent = `MVR ${money(subtotal)}`;
  totalEl.textContent = `MVR ${money(total)}`;
  previewSubtotal.textContent = `MVR ${money(subtotal)}`;
  previewTax.textContent = `MVR ${money(tax)}`;
  previewTotal.textContent = `MVR ${money(total)}`;

  previewCompanyInfo.textContent = companyInfoEl.value;
  previewClientInfo.textContent = clientInfoEl.value;
  previewAccountName.textContent = accountNameEl.value;
  previewAccountNumber.textContent = accountNumberEl.value;
  previewInvoiceNumber.textContent = invoiceNumberEl.value;
}

// Add new invoice item
addItemBtn.addEventListener('click', ()=>{
  items.push({description:'', qty:'', rate:''});
  renderTable();
  updateInvoice();
});

// Handle input changes in table and fields
document.addEventListener('input', e=>{
  const target = e.target;
  if(target.dataset.index && target.dataset.field){
    const idx = Number(target.dataset.index);
    const field = target.dataset.field;
    items[idx][field] = target.value;
    updateInvoice();
  }
  if(['companyInfo','clientInfo','accountName','accountNumber','invoiceNumber','taxRate'].includes(target.id)){
    updateInvoice();
  }
});

// Remove item
document.addEventListener('click', e=>{
  const target = e.target;
  if(target.dataset.action==='remove'){
    const idx = Number(target.dataset.index);
    items.splice(idx,1);
    renderTable();
    updateInvoice();
  }
});

// Theme switching
themeSelector.addEventListener('change', e=>{
  const theme = e.target.value;
  invoiceEl.className = 'max-w-7xl mx-auto my-10 p-10 bg-white shadow rounded-md transition-all duration-300 theme-' + theme;

  // Update table header color in preview
  const tableHeads = previewTable.querySelectorAll('thead');
  tableHeads.forEach(th => {
    th.style.backgroundColor = themeColors[theme];
    th.style.color = '#fff';
  });

  // Update invoice title color
  invoiceEl.querySelector('.text-theme').style.color = themeColors[theme];
});

// Download as PDF
downloadBtn.addEventListener('click', ()=>{
  const opt = {
    margin:0.2,
    filename:`Invoice_${invoiceNumberEl.value || '000'}.pdf`,
    image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2},
    jsPDF:{unit:'in', format:'letter', orientation:'portrait'}
  };
  html2pdf().set(opt).from(invoiceEl).save();
});

// Initial render
renderTable();
updateInvoice();
themeSelector.dispatchEvent(new Event('change'));