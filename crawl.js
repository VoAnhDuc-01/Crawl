(async function autoSubmit() {
  // Danh sach CCCD

  const inputSelector = '#public-result-identity';
  const buttonSelector = '.public-result-submit';
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function setInputValue(input, value) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const results = [];

  for (let i = 0; i < cccd.length; i++) {
    const inputElement = document.querySelector(inputSelector) || document.querySelector('input[type="text"]');
    const submitButton = document.querySelector(buttonSelector);

    if (!inputElement || !submitButton) {
      console.error("Khong tim thay o nhap hoac nut bam!");
      return;
    }

    inputElement.focus();
    setInputValue(inputElement, cccd[i]);
    console.log(`[${i + 1}/${cccd.length}] Da cap nhat ma: ${cccd[i]}`);

    await sleep(2000);
    submitButton.click();
    console.log(`[${i + 1}/${cccd.length}] Da bam Tra cuu. Dang cho ket qua...`);

    await sleep(4000);

    const bodyText = document.body.innerText;
    let statusText = "Khong tim thay ket qua / Loi";

    // Kiem tra neu trung tuyen
    if (bodyText.includes("CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN NGÀNH") || bodyText.includes("Chúc mừng bạn đã trúng tuyển ngành")) {
      
      // CÁCH 1: Lay qua DOM Element (Chon dung the chua Ten Nganh tren giao dien)
      const majorHeading = document.querySelector('.public-result-detail h2, .public-result-detail .title, h3, h4');
      
      if (majorHeading && majorHeading.innerText.trim()) {
        const majorName = majorHeading.innerText.trim();
        statusText = `CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN NGÀNH ${majorName}`;
      } else {
        // CÁCH 2: Dung Regex trich xuat chu neu khong tim thay DOM Element
        const match = bodyText.match(/CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN NGÀNH\s+([^\n\r·]+)/i);
        if (match && match[1]) {
          statusText = `CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN NGÀNH ${match[1].trim()}`;
        } else {
          statusText = "CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN";
        }
      }

    } else if (bodyText.includes("Không trúng tuyển") || bodyText.includes("KHÔNG TRÚNG TUYỂN")) {
      statusText = "Không trúng tuyển";
    }

    results.push({
      stt: i + 1,
      cccd: cccd[i],
      ket_qua: statusText
    });

    console.log(` -> Ket qua [${cccd[i]}]: ${statusText}`);
  }

  console.log("Da hoan tat kiem tra toan bo danh sach ma!");

  // Tai file JSON sach se ve may
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "ket_qua_tra_cuu.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
})();
