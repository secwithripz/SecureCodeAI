document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const codeInput = document.getElementById("codeInput");
  const output = document.getElementById("output");
  const loading = document.getElementById("loading");

  scanBtn.addEventListener("click", async () => {
    const codeToScan = codeInput.value.trim();
    if (!codeToScan) {
      alert("⚠️ Please paste some code to scan.");
      return;
    }

    loading.style.display = "flex";
    output.innerHTML = "";

    try {
      const response = await fetch("http://localhost:3001/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeToScan }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      // Animate result output letter-by-letter
      const text = window.marked ? marked.parse(result.result) : result.result;

      if (window.marked) {
        // If markdown, parse then animate text content inside #output
        output.innerHTML = "";
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        let idx = 0;
        function typeWriter() {
          if (idx <= plainText.length) {
            output.textContent = plainText.slice(0, idx);
            idx++;
            setTimeout(typeWriter, 10);
          }
        }
        typeWriter();
      } else {
        // Plain text animate
        let idx = 0;
        function typeWriter() {
          if (idx <= text.length) {
            output.textContent = text.slice(0, idx);
            idx++;
            setTimeout(typeWriter, 10);
          }
        }
        typeWriter();
      }
    } catch (err) {
      output.innerHTML = `<p style="color: #ff4444;">❌ ${err.message}</p>`;
    } finally {
      loading.style.display = "none";
    }
  });
});
