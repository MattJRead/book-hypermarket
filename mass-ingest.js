// The Categories you requested
const queries = [
  "fiction", 
  "non-fiction", 
  "science+fiction", 
  "comic+books", 
  "art", 
  "photography", 
  "educational", 
  "language"
];

// How deep into Google's vault to dig per category (5 pages = 200 books per genre)
const pagesPerQuery = 5; 

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
      const url = `http://localhost:3000/api/ingest?q=${q}&page=${p}`;
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
  
  console.log("\n Mass Ingestion Complete. The Vault is full.");
}

run();