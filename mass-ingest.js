// The Expanded Categories and Niches
const queries = [
  "upcoming books 2026",
  "new releases 2026",
  "expected releases 2026 fiction",
  "highly anticipated books 2026",
  "pre order fantasy books",
  "pre order thriller novels",
  "pre order science fiction books",
  "pre order romance novels",
  "Signed first edition books",
  "limited edition books",
  "collector's edition books",
  "Teen and Young Adult novels"
];

// Increased dig depth: 15 pages = 600 books per niche above
const pagesPerQuery = 15; 

// A 3-second breather between requests to prevent server crashes and API bans
const delayMs = 3000; 

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("🚀 Commencing Mass Ingestion Protocol...");
  
  for (const q of queries) {
    console.log(`\n========================================`);
    console.log(` BEGINNING CATEGORY: ${q.toUpperCase()}`);
    console.log(`========================================`);
    
    for (let p = 1; p <= pagesPerQuery; p++) {
      const url = `http://localhost:3000/api/ingest?q=${q.replace(/ /g, '+')}&page=${p}`;
      console.log(`\n📡 Stripmining: ${url}`);
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          console.log(`✅ Success: ${data.message}`);
        } else {
          console.log(`⚠️ Alert: ${data.error}`);
        }
      } catch (e) {
        console.error(`❌ Misfire on ${url}:`, e.message);
      }
      
      console.log(`⏳ Cooling down for ${delayMs/1000} seconds...`);
      await sleep(delayMs);
    }
  }
  
  console.log("\n🎉 Mass Ingestion Complete. The Vault is full.");
}

run();