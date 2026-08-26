import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
  console.log("Checking buckets...");
  const { data: buckets, error: getError } = await supabase.storage.listBuckets();
  if (getError) {
    console.error("Error listing buckets:", getError);
    return;
  }
  
  const hasResumes = buckets.find(b => b.name === "resumes");
  if (!hasResumes) {
    console.log("Creating 'resumes' bucket...");
    const { error: createError } = await supabase.storage.createBucket("resumes", { public: true });
    if (createError) {
      console.error("Error creating bucket:", createError);
    } else {
      console.log("Bucket created successfully.");
    }
  } else {
    console.log("'resumes' bucket already exists.");
  }
}

setup();
