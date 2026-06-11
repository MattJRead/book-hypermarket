const delayMs = 3000; // 3-second breather to avoid getting IP banned by Blackwells

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("🦇 Deploying Cover Hunter Protocol...");
  
  let keepHunting = true;
  let batch = 1;

  while (keepHunting) {
    console.log(`\n📡 Executing Sweep #${batch}...`);
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/fix-covers');
      const data = await res.json();
      
      if (data.success) {
        console.log(`✅ ${data.message}`);
        
        // If the engine says everything is full, shut down the script
        if (data.message.includes('All books have covers')) {
          keepHunting = false;
        }
      } else {
        console.log(`⚠️ Alert: ${data.error}`);
      }
    } catch (e) {
      console.error(`❌ Connection failed. Ensure the Next.js server is running.`);
      keepHunting = false;
    }
    
    if (keepHunting) {
      console.log(`⏳ Cooling down to avoid detection...`);
      await sleep(delayMs);
      batch++;
    }
  }
  
  console.log("\n🎉 Cover Hunter Protocol Complete. The Vault is visually secured.");
}

run();