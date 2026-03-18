import { Client, Databases, Query, Permission, Role } from "node-appwrite";
import "dotenv/config";

const endpoint = process.env.APPWRITE_ENDPOINT || "http://localhost/v1";
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.APPWRITE_DATABASE_ID;

const COLLECTIONS = [
  {
    id: process.env.APPWRITE_USER_PROFILE_COLLECTION_ID || "user_profile",
    // Profile needs read/update for owner. Create is handled by collection permission.
    ownerPerms: ["read", "update"]
  },
  {
    id: process.env.APPWRITE_TRAINING_SESSION_COLLECTION_ID || "training_session",
    ownerPerms: ["read"]
  },
  {
    id: process.env.APPWRITE_TRAINING_TRADE_LOG_COLLECTION_ID || "training_trade_log",
    ownerPerms: ["read"]
  },
  {
    id: process.env.APPWRITE_TRAINING_BALANCE_LEDGER_COLLECTION_ID || "training_balance_ledger",
    ownerPerms: ["read"]
  }
];

if (!endpoint || !projectId || !apiKey || !dbId) {
  console.error("Missing configuration");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function migrate() {
  console.log("Starting permission migration...");

  for (const col of COLLECTIONS) {
    if (!col.id) continue;
    console.log(`Migrating collection: ${col.id}`);
    
    let lastId = null;
    let count = 0;
    let updatedCount = 0;

    while (true) {
      const queries = [Query.limit(100)];
      if (lastId) queries.push(Query.cursorAfter(lastId));

      const res = await databases.listDocuments(dbId, col.id, queries);
      if (res.documents.length === 0) break;

      for (const doc of res.documents) {
        lastId = doc.$id;
        const userId = doc.user_id;
        if (!userId) {
          // console.warn(`Skipping doc ${doc.$id} (no user_id)`);
          continue;
        }

        const requiredPerms = col.ownerPerms.map(p => Permission[p](Role.user(userId)));
        const currentPerms = doc.$permissions || [];
        
        // Merge permissions
        const newPerms = [...new Set([...currentPerms, ...requiredPerms])];
        
        // Check if update needed
        const needsUpdate = requiredPerms.some(p => !currentPerms.includes(p));

        if (needsUpdate) {
          await databases.updateDocument(dbId, col.id, doc.$id, {}, newPerms);
          process.stdout.write(".");
          updatedCount++;
        }
        count++;
      }
    }
    console.log(`\nProcessed ${count} documents in ${col.id}, updated ${updatedCount}`);
  }
  console.log("Migration complete.");
}

migrate().catch(console.error);
